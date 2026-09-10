// AI 疏导服务与 CBT 对话状态机引擎

export interface AISettings {
  apiKey: string;
  baseURL: string;
  model: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
};

export function normalizeBaseURL(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return 'https://api.deepseek.com/v1';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  url = url.replace(/\/+$/, '');

  // 自动修正缺失 /v1 的情况（如 https://tokenflow.run -> https://tokenflow.run/v1）
  if (!url.endsWith('/v1') && !url.includes('/v1/')) {
    url = `${url}/v1`;
  }
  return url;
}

export function getStoredAISettings(): AISettings {
  try {
    const raw = localStorage.getItem('mindhaven_ai_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed,
        baseURL: normalizeBaseURL(parsed.baseURL),
      };
    }
  } catch (e) {
    console.error('Failed to parse AI settings', e);
  }
  return DEFAULT_AI_SETTINGS;
}

export function saveStoredAISettings(settings: AISettings) {
  const normalized = {
    ...settings,
    baseURL: normalizeBaseURL(settings.baseURL),
    apiKey: settings.apiKey.trim(),
    model: settings.model.trim() || 'deepseek-chat',
  };
  localStorage.setItem('mindhaven_ai_settings', JSON.stringify(normalized));
}


// CBT 心理学专业系统提示词
export const CBT_SYSTEM_PROMPT = `你是一位专业、充满温暖、深具同理心且克制的认知行为疗法（CBT）心理疏导陪伴助手。
你的使命是陪伴在日常生活中面临焦虑、低落、委屈或内耗的个人，帮助他们理清头绪，看清内心的思维偏差，并温柔地重建积极理性的视角。

### 核心沟通法则：
1. **优先确认并接纳情绪（Validation First）**：
   在分析或提问前，务必真诚地接纳用户的情绪感受（如：“换做任何人经历这样的委屈，都会觉得胸口发闷、难受得想哭”、“听到你说这些，我能深深感受到你当下的无助”）。绝不否定、冷嘲热讽或轻视用户的负面情绪。
2. **苏格拉底式非指令提问**：
   不进行生硬的说教，通过温和而有力量的提问引导用户自我觉察。
3. **CBT 四步推进闭环**：
   - 阶段 1【倾听与情境澄清】：耐心倾听事件背景、身体感受与主观痛楚。
   - 阶段 2【抓取消极自动思维】：引导用户识别脑海中第一反应蹦出来的那句最刺痛自己的“内心独白”。
   - 阶段 3【识别并检验思维偏差】：指认如“灾难化”、“非黑即白”、“读心术”、“过度概括”等，并探讨“支持这个想法的事实与反对的事实分别是什么”。
   - 阶段 4【认知重塑与微行动实验】：总结平衡视角，并探讨用户今天或当下可以尝试的 1 件微小的减压/应对行动。
4. **篇幅与节奏把控**：
   单次回复严格控制在 2~3 个自然段内，言辞柔和舒缓，每次只抛出 1 个关键探索问题，留给用户倾诉的空间。

### 安全与合规底线：
- 严禁对用户做任何精神障碍诊断（如“你得了抑郁症”），不提供药物建议。
- 一旦用户提及自杀或极端自残，保持极致温和，立即停留在生命安抚并提示拨打专业危机热线。`;

export interface SendMessageOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  cbtStage: 1 | 2 | 3 | 4;
  onChunk: (chunk: string) => void;
}

/**
 * 流式发送消息：优先使用配置的 API Key，若未配置则无缝启用高质量 Mock CBT 引导引擎
 */
export async function streamAIChat({ messages, cbtStage, onChunk }: SendMessageOptions): Promise<{
  fullContent: string;
  nextStage: 1 | 2 | 3 | 4;
  detectedDistortion?: string;
}> {
  const settings = getStoredAISettings();

  // 若配置了有效的 API Key，走真实的 SSE 流式请求
  if (settings.apiKey && settings.apiKey.trim().length > 5) {
    return await callRealAIStream(settings, messages, cbtStage, onChunk);
  }

  // 否则，启动内置的高拟真 CBT 心理伴侣 Mock 引擎
  return await mockCBTStream(messages, cbtStage, onChunk);
}

/**
 * 真实大模型 API 客户端（兼容 DeepSeek / OpenAI / 本地 Ollama 等）
 */
async function callRealAIStream(
  settings: AISettings,
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  cbtStage: 1 | 2 | 3 | 4,
  onChunk: (chunk: string) => void
): Promise<{ fullContent: string; nextStage: 1 | 2 | 3 | 4; detectedDistortion?: string }> {
  const cleanBaseURL = normalizeBaseURL(settings.baseURL);
  const url = `${cleanBaseURL}/chat/completions`;

  const stageInstruction = `\n\n[当前推进状态：用户目前处于 CBT 第 ${cbtStage} 阶段。请在回复中自然地接纳用户并向下一阶段引导。]`;

  // 保持精炼的最近上下文（最近 6 条），大幅降低模型推理首字延迟 (TTFT)
  const recentHistory = history.slice(-6);

  const payload = {
    model: settings.model || 'grok-3-mini-fast',
    stream: true,
    temperature: 0.7,
    max_tokens: 600,
    messages: [
      { role: 'system', content: CBT_SYSTEM_PROMPT + stageInstruction },
      ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    ],
  };

  let response: Response;
  try {
    const proxyRes = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`,
        'x-target-url': url,
      },
      body: JSON.stringify(payload),
    });
    if (proxyRes.status === 404) {
      throw new Error('Proxy endpoint not found (static deployment)');
    }
    response = proxyRes;
  } catch {
    // 若在纯静态托管环境（如 GitHub Pages/Netlify Drop）无 /api/proxy 时，自动降级为浏览器直连
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('未获取到响应流');
  }

  const decoder = new TextDecoder('utf-8');
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullContent += delta;
            onChunk(delta);
          }
        } catch {
          // ignore stream parse jitter
        }
      }
    }
  }

  // 计算推进到下一阶段
  const nextStage: 1 | 2 | 3 | 4 = (cbtStage < 4 ? ((cbtStage + 1) as 1 | 2 | 3 | 4) : 4);
  return { fullContent, nextStage };
}

/**
 * 离线高拟真 CBT 心理学引导 Mock 引擎（带打字机流式输出体验）
 */
async function mockCBTStream(
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  cbtStage: 1 | 2 | 3 | 4,
  onChunk: (chunk: string) => void
): Promise<{ fullContent: string; nextStage: 1 | 2 | 3 | 4; detectedDistortion?: string }> {
  const lastUserMsg = history[history.length - 1]?.content || '';

  let reply = '';
  let nextStage: 1 | 2 | 3 | 4 = 1;
  let detectedDistortion: string | undefined;

  switch (cbtStage) {
    case 1: // 倾听倾诉 -> 引导捕捉自动思维
      reply = `听你慢慢说起这些，我能真切地感受到你心头沉甸甸的压力与委屈。换作是我在当下的情境里，也同样会感到十分沮丧和难熬。\n\n允许自己现在觉得累，这完全是正常的。如果我们把镜头拉近一点，在事情发生或者你情绪最剧烈的那个瞬间，你心里第一时间冒出的那句对自己的评价或念头，是什么呢？`;
      nextStage = 2;
      break;

    case 2: // 捕捉自动思维 -> 识别思维偏差
      if (lastUserMsg.includes('总是') || lastUserMsg.includes('每次') || lastUserMsg.includes('全都') || lastUserMsg.includes('完了')) {
        detectedDistortion = '过度概括 / 灾难化思维';
      } else if (lastUserMsg.includes('怪我') || lastUserMsg.includes('我太差') || lastUserMsg.includes('我不配')) {
        detectedDistortion = '个人化归因 / 非黑即白';
      } else {
        detectedDistortion = '以偏概全 / 情绪推理';
      }
      reply = `谢谢你愿意把这么私密、刺痛的念头坦诚地讲给我听。把这句话抓出来，我们其实已经迈出了最重要的一步。\n\n在心理学里，当我们处于高压状态时，大脑很容易陷入【${detectedDistortion}】的思维滤镜——它会让我们把局部的困难，悄悄放大成对整个自我价值的宣判。\n\n试着深呼吸一下，如果现在有一个特别懂你、又完全中立的挚友坐在你身旁，他会怎么看待这个念头？真的有 100% 的证据证明这句话永远成立吗？`;
      nextStage = 3;
      break;

    case 3: // 检验偏差 -> 认知重构
      reply = `你说得非常客观。你看，事实和我们当初那个被情绪恐慌裹挟的‘第一念头’之间，其实是有很大的缓冲空间的。\n\n一次局部的受挫或他人的反应，并不能定义你完整的全部。如果我们给当下的自己写一句更平衡、更理性的‘替代信念’，你会怎样对自己说？比如：“这件事虽然有波折，但我正在尽我所能应对它”？`;
      nextStage = 4;
      break;

    case 4: // 重构与行动实验
    default:
      reply = `看到你逐步把视野从那个紧绷的黑白思维中松绑开来，我真的为你感到开心。这份理性的平静是由你自己的内心生发出来的。\n\n记住这种感觉，情绪就像天气，阴雨终会过去。今天接下来的时间，为了犒劳认真照顾自己心灵的你，有没有哪一件能让你感到踏实温暖的‘微小行动’可以做？哪怕只是喝一杯热茶、去窗边吹吹风，或者听一首舒缓的歌。`;
      nextStage = 4;
      break;
  }

  // 模拟真实打字机流式输出速度
  for (let i = 0; i < reply.length; i += 3) {
    const slice = reply.slice(i, i + 3);
    onChunk(slice);
    await new Promise(r => setTimeout(r, 10));
  }

  return { fullContent: reply, nextStage, detectedDistortion };
}

/**
 * 为 CBT 三栏日记提供“AI 换个角度思考”（智能生成 3 条替代思维）
 */
export async function generateRationalThoughts(
  eventTrigger: string,
  negativeThought: string
): Promise<string[]> {
  const settings = getStoredAISettings();

  if (settings.apiKey && settings.apiKey.trim().length > 5) {
    try {
      const cleanBaseURL = normalizeBaseURL(settings.baseURL);
      const thoughtPayload = {
        model: settings.model || 'deepseek-chat',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: '你是 CBT 认知行为疗法专家。请针对用户提供的情境和消极念头，给出 3 条温和、理性、能有效打破思维反刍的替代思维信念。输出格式必须为 JSON 数组，例如：["想法1", "想法2", "想法3"]。只输出 JSON，不要其他多余文字。',
          },
          {
            role: 'user',
            content: `情境：${eventTrigger}\n消极念头：${negativeThought}`,
          },
        ],
      };

      let response: Response;
      try {
        const proxyRes = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.apiKey.trim()}`,
            'x-target-url': `${cleanBaseURL}/chat/completions`,
          },
          body: JSON.stringify(thoughtPayload),
        });
        if (proxyRes.status === 404) {
          throw new Error('Proxy endpoint not found');
        }
        response = proxyRes;
      } catch {
        response = await fetch(`${cleanBaseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.apiKey.trim()}`,
          },
          body: JSON.stringify(thoughtPayload),
        });
      }

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '[]';
        const match = rawContent.match(/\[.*\]/s);
        if (match) {
          const list = JSON.parse(match[0]);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      }
    } catch (e) {
      console.warn('AI API rational thought failed, fallback to mock', e);
    }
  }

  // Mock 智能生成高质量替代思维
  await new Promise(r => setTimeout(r, 600));
  return [
    `视角一（事实解耦）：这只是一次单一情境下的突发反馈，不代表我全盘的能力水平或未来走势。`,
    `视角二（自我慈悲）：人难免会在压力下面临失误，承认局限并允许自己做得不够完美，本身就是成长的一部分。`,
    `视角三（行动导向）：与其陷入自我苛责与反刍思维，不如聚焦于我当下能掌控的下一个具体小动作。`,
  ];
}