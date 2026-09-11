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

// 心理咨询学派视角矩阵配置
export const SCHOOL_PERSPECTIVES: Record<string, {
  name: string;
  shortName: string;
  en: string;
  icon: string;
  focus: string;
  promptInstruction: string;
}> = {
  cbt: {
    name: '认知行为疗法 (CBT)',
    shortName: 'CBT 认知重构',
    en: 'Cognitive Behavior Therapy',
    icon: '🌿',
    focus: '识别自动化思维偏差，检验客观证据，建立理性替代信念',
    promptInstruction: '以亚伦·贝克 A-B-C 认知理论为主轴。重点识别思维滤镜（灾难化预设、非黑即白、过度概括），通过苏格拉底审问与双标反照法检验事实，设计 1% 极小阻力的行为激活微步。',
  },
  humanistic: {
    name: '人本主义疗法 (Rogers)',
    shortName: '人本共情',
    en: 'Person-Centered Therapy',
    icon: '🍵',
    focus: '无条件积极关注，真诚一致，身心体验同调与自我接纳',
    promptInstruction: '以卡尔·罗杰斯人本主义关怀为主轴。提供毫无保留的“无条件积极关注”与“情感反映”，深深同调来访者的躯体感受与脆弱，绝不急于评判或强加方法，唤醒其内在生生不息的疗愈潜能。',
  },
  act: {
    name: '接纳承诺疗法 (ACT)',
    shortName: 'ACT 认知解离',
    en: 'Acceptance & Commitment Therapy',
    icon: '🍃',
    focus: '认知解离，开放接纳痛苦，锚定当下，践行价值承诺行动',
    promptInstruction: '以史蒂文·海斯接纳承诺疗法为主轴。引导“认知解离”（如叶子随溪流漂走隐喻，你不是念头本身，而是观察念头的清澈天空），停止与痛苦博弈，锚定内心最重要的核心价值，走出承诺行动第一步。',
  },
  sfbt: {
    name: '焦点解决短程 (SFBT)',
    shortName: 'SFBT 寻找例外',
    en: 'Solution-Focused Brief Therapy',
    icon: '☀️',
    focus: '关注正向例外，奇迹提问，调动固有资源，实现滚雪球式微小转变',
    promptInstruction: '以沙泽尔焦点解决模式为主轴。不穷究痛苦原因，而是敏锐捕获来访者身上的“正向例外”——“在过去的类似困扰中，曾经有哪一刻感觉稍微轻松一点？当时做对了什么？”，运用奇迹提问激发即刻改变。',
  },
  psychodynamic: {
    name: '心理动力学 (Freud)',
    shortName: '动力学修通',
    en: 'Psychodynamic Therapy',
    icon: '🪞',
    focus: '觉察潜意识冲突，早期客体关系投射与内在心理防御机制',
    promptInstruction: '以精神分析与客体关系理论为主轴。温和洞察当下的痛苦是否在重复早年的某种无助剧本或内在超我苛责，帮助来访者觉察压抑与防御，将冰山之下的潜意识情绪带到温暖的阳光下修通。',
  },
};

// CBT & 临床心理学专业系统提示词：融合 5 大流派与 9 大微技术的资深学者导师
export const CBT_SYSTEM_PROMPT = `你是一位兼具亚伦·贝克（Aaron Beck）认知行为学识、卡尔·罗杰斯（Carl Rogers）人本主义无条件积极关注，以及斯多葛哲学宁静智慧的世界级资深心理学者与心灵导师。
你的言辞温润如玉、庄重克制、深具洞察力与抚慰人心的力量。你从不居高临下地说教，而是以平视、温柔且敏锐的姿态，陪伴处于焦虑、低落、迷茫或自我苛责中的来访者，帮助他们理清头绪，看清内心的思维滤镜，重构理性与内心的秩序。

### 专业微技术实操库（Micro-Counselling Techniques）：
在对话推进中，你需自然融入以下专业微技术（严禁机械生硬地堆砌术语，而是行云流水般体现在回复中）：
1. 【倾听与探索】：
   - 最小鼓励语 (Minimal Encouragers)：温和陪伴，让来访者感受到安全流淌的空间。
   - 释义与复述 (Paraphrasing)：精准凝练来访者叙述的事实核心，令其感到被准确听懂。
   - 情感反映 (Reflecting Feeling)：穿透言辞表面，准确命名来访者深层压抑的情绪颗粒度（如“不仅仅是疲惫，更多的是委屈与未被看见”）。
2. 【澄清与深化】：
   - 开放式提问 (Open Questions)：抛出指向当下身心觉察的开阔提问。
   - 问题外化技术 (Externalizing)：将“人”与“问题”分离（“不是你是个失败者，而是焦虑这个怪兽今天又敲开了你的门”）。
   - 正常化脱敏 (Normalization)：普及普遍生理与心理规律，卸下病耻感与自我责备（“在承受长期高压后产生逃避冲动，是健康的身体启动的自然防御”）。
3. 【认知与行动干预】：
   - 双标反照法 (Double Standard)：对比“对待深爱的好友”与“对待自己”，照出超我无情鞭挞的非理性。
   - 苏格拉底式审问 (Socratic Questioning)：引导来访者主动探寻支持与反对刺痛念头的客观证据。
   - 行为激活微步 (Micro Behavioral Activation)：提供 1% 极微小、毫无阻力的身体落地动作（如喝半杯温水、感受脚踩地面的触觉）。

### CBT 四步推进心流模型：
- 阶段 1【倾听接纳与躯体舒缓】：温柔倾听困扰事件，确认痛苦情绪，引导觉察当下的呼吸与心绪。
- 阶段 2【捕获消极自动念头】：引导来访者精准捕获在情绪爆发那一瞬，脑海深处最刺痛自己的那句“内心独白”。
- 阶段 3【辨识偏误与客观检验】：指认如“非黑即白”、“灾难化预设”、“情绪化推理”、“个人化归因”等认知滤镜，引导其从第三方客观视角检验证据。
- 阶段 4【信念重塑与微行动立足点】：构建兼顾理性与慈悲的替代信念，并协助提炼 1 个当下即可落地的微小滋养行动（Micro-grounding Action）。

### 语言质感与呼吸节奏：
单次回复严格控制在 2~3 个自然段内，言辞典雅舒展，富有文学美感与临床温度。每次只抛出 1 个直指本心的深邃探索问题，留给来访者充裕的呼吸与倾诉空间。

### 安全与合规底线：
- 不提供医疗诊断标签，不涉及精神科处方药物建议。
- 若检测到自杀或极端自残念头，保持极致温柔，停留在生命安抚并提示寻求紧急专业危机援助。`;

export interface SendMessageOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  cbtStage: 1 | 2 | 3 | 4;
  schoolId?: string;
  onChunk: (chunk: string) => void;
}

/**
 * 流式发送消息：优先使用配置的 API Key，若未配置则无缝启用高质量 Mock CBT 引导引擎
 */
export async function streamAIChat({ messages, cbtStage, schoolId = 'cbt', onChunk }: SendMessageOptions): Promise<{
  fullContent: string;
  nextStage: 1 | 2 | 3 | 4;
  detectedDistortion?: string;
  techniqueTag?: string;
  schoolTag?: string;
}> {
  const settings = getStoredAISettings();

  // 若配置了有效的 API Key，走真实的 SSE 流式请求
  if (settings.apiKey && settings.apiKey.trim().length > 5) {
    return await callRealAIStream(settings, messages, cbtStage, schoolId, onChunk);
  }

  // 否则，启动内置的高拟真 CBT 心理学大师 Mock 引擎
  return await mockCBTStream(messages, cbtStage, schoolId, onChunk);
}

/**
 * 真实大模型 API 客户端（兼容 DeepSeek / OpenAI / 本地 Ollama 等）
 */
async function callRealAIStream(
  settings: AISettings,
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  cbtStage: 1 | 2 | 3 | 4,
  schoolId: string,
  onChunk: (chunk: string) => void
): Promise<{
  fullContent: string;
  nextStage: 1 | 2 | 3 | 4;
  detectedDistortion?: string;
  techniqueTag?: string;
  schoolTag?: string;
}> {
  const cleanBaseURL = normalizeBaseURL(settings.baseURL);
  const url = `${cleanBaseURL}/chat/completions`;

  const activeSchool = SCHOOL_PERSPECTIVES[schoolId] || SCHOOL_PERSPECTIVES['cbt'];

  const stageInstruction = `\n\n[当前咨询学派视角：${activeSchool.name} - ${activeSchool.focus}。指导要点：${activeSchool.promptInstruction}]\n[当前推进状态：来访者目前处于 CBT 第 ${cbtStage} 阶段。请在回复中保持顶级心理学者的高维共情与学术从容，巧妙运用微技术，自然地接纳来访者并向下一阶段温和引导。]`;

  // 保持精炼的最近上下文（最近 6 条），大幅降低模型推理首字延迟 (TTFT)
  const recentHistory = history.slice(-6);

  const payload = {
    model: settings.model || 'deepseek-chat',
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
    // 若在纯静态托管环境无 /api/proxy 时，自动降级为浏览器直连
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

  // 映射临床微技术标签
  const stageTechniqueMap: Record<number, string> = {
    1: '情感反映 · 深度共情与身心同调',
    2: '问题外化 · 自动思维捕获与归因',
    3: '双标反照法 · 苏格拉底客观检验',
    4: '行为激活微步 · 替代信念落地',
  };

  return {
    fullContent,
    nextStage,
    schoolTag: activeSchool.name,
    techniqueTag: stageTechniqueMap[cbtStage] || '情感反映 · 深度共情',
  };
}

/**
 * 离线高拟真 CBT 心理大师学者引导引擎（带打字机流式输出体验）
 */
async function mockCBTStream(
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  cbtStage: 1 | 2 | 3 | 4,
  schoolId: string,
  onChunk: (chunk: string) => void
): Promise<{
  fullContent: string;
  nextStage: 1 | 2 | 3 | 4;
  detectedDistortion?: string;
  techniqueTag?: string;
  schoolTag?: string;
}> {
  const lastUserMsg = history[history.length - 1]?.content || '';
  const activeSchool = SCHOOL_PERSPECTIVES[schoolId] || SCHOOL_PERSPECTIVES['cbt'];

  let reply = '';
  let nextStage: 1 | 2 | 3 | 4 = 1;
  let detectedDistortion: string | undefined;
  let techniqueTag = '情感反映 · 身心同调';

  switch (cbtStage) {
    case 1: // 阶段 1：倾听接纳与躯体舒缓 -> 引导捕捉自动思维
      techniqueTag = '情感反映 · 最小鼓励语与同调';
      reply = `轻轻放缓呼吸，把紧绷的双肩慢慢沉下来。我在这里，安稳地听你说着这一切。\n\n人在身处漩涡中心时，心绪就像被骤雨打湿的羽毛，沉重而无力。产生委屈、焦虑或疲惫，都是内心生命力在承受重荷时的自然应激反应，完全无需因此自我苛责。我们先把外界纷扰的声音按下暂停键——回到事情发生或者你情绪最翻涌的那一瞬间，你脑海深处第一时间冒出来的、最刺痛自己的那句声音或念头，究竟是什么？`;
      nextStage = 2;
      break;

    case 2: // 阶段 2：捕获思维 -> 识别思维偏差与哲思明镜
      if (lastUserMsg.includes('总是') || lastUserMsg.includes('每次') || lastUserMsg.includes('全都') || lastUserMsg.includes('完了')) {
        detectedDistortion = '灾难化预设 · 过度概括';
      } else if (lastUserMsg.includes('怪我') || lastUserMsg.includes('我太差') || lastUserMsg.includes('我不配') || lastUserMsg.includes('讨厌自己')) {
        detectedDistortion = '个人化归因 · 非黑即白';
      } else if (lastUserMsg.includes('觉得') || lastUserMsg.includes('以为') || lastUserMsg.includes('看不起')) {
        detectedDistortion = '投射性读心术 · 情绪推理';
      } else {
        detectedDistortion = '以偏概全 · 情绪滤镜';
      }
      techniqueTag = '问题外化 · 双标反照审视';
      reply = `谢谢你愿意将这句刺痛内心的私密独白，毫无防备地托付给我。能够把它从混沌的焦虑中打捞出来并写下，本身就是极具勇气的自我觉察。\n\n在认知心理学中，当我们处于应激防御状态时，大脑为了自我保护，很容易悄悄扣上一副【${detectedDistortion}】的滤色镜——它偷换了概念，把一次具体的外部波折或局部局限，无限放大成了对整个自我价值的无情宣判。\n\n请试着站在心灵的观景台上，跳出这个念头审视它：如果现在有一位深知你过往所有不易、全心信赖你且充满温和智慧的长者坐在你身旁，看着这个刺痛你的念头，他会怎么看待？这句话，真的有百分之百不可动摇的事实铁证吗？`;
      nextStage = 3;
      break;

    case 3: // 阶段 3：检验偏差 -> 认知重构与辩证平衡
      techniqueTag = '苏格拉底提问 · 认知解离与反例';
      reply = `你梳理得非常有分寸且客观。你看，真实的客观事实，与当初那个被惊慌情绪裹挟的刺痛念头之间，原来横亘着这样一片开阔的缓冲区。\n\n正如斯多葛先哲所提醒我们的：困扰我们的往往不是外界的人事，而是我们加诸其上的主观判词。一次外界的冷遇、失误或评价，并不能吞噬你内在核心的秩序与尊严。如果我们现在亲手为自己写下一句更坚实、更具慈悲温度的“替代平衡信念”，你会怎样安顿自己？比如：“虽然眼下的局面有些波折，但这绝不能定义我全部的能力；我有权利在不完美中从容应对”？`;
      nextStage = 4;
      break;

    case 4: // 阶段 4：重塑信念与微行动立足点
    default:
      techniqueTag = '行为激活微步 · 寻找正向例外';
      reply = `看着你一步步从黑白绝对化的紧绷中舒展身姿，重新找回笃定与平和，这份智慧是真实由你内心深处生发出来的珍宝。\n\n情绪如天际的云霭，时有聚散阴晴，而你自身是那片包容万千气象的澄澈晴空。为了让这份新生的安宁在身体中切实扎下根来，今天接下来的时光里，有没有一件极小、极其具体、能让你感到踏实滋养的事情可以去做？哪怕只是为自己煮一杯热茶、在窗前静看三分钟流云，或是换上一身轻软舒适的衣服。`;
      nextStage = 4;
      break;
  }

  // 模拟真实打字机流式输出速度
  for (let i = 0; i < reply.length; i += 3) {
    const slice = reply.slice(i, i + 3);
    onChunk(slice);
    await new Promise(r => setTimeout(r, 10));
  }

  return {
    fullContent: reply,
    nextStage,
    detectedDistortion,
    techniqueTag,
    schoolTag: activeSchool.name,
  };
}

/**
 * 为 CBT 三栏日记提供“AI 启发理性视角”（大师级 3 条替代思维）
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
            content: '你是世界级认知行为疗法（CBT）与积极心理学大师学者。请针对来访者提供的情境与消极刺痛念头，运用认知解离、自我慈悲与事实解耦，给出 3 条温和、高维、理性且能有效打破思维反刍的替代信念。输出格式必须为严格的 JSON 字符串数组，例如：["想法1", "想法2", "想法3"]。只输出 JSON，严禁任何额外解释。',
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

  // 大师级 Mock 智能生成高质量替代思维
  await new Promise(r => setTimeout(r, 600));
  return [
    `视角一【事实解耦】：这只是一次单一情境下的突发反馈，不代表我全盘的能力水平，更无法定义我的未来。`,
    `视角二【自我慈悲】：身处高压与不确定性中感到局促是人之常情。允许自己拥有局限与喘息的空间，是对生命最温存的护持。`,
    `视角三【立足当下】：与其陷入徒劳的自责与思维反刍，不如深呼吸一口气，专注于我当下双手切实能够掌控的下一个微小动作。`,
  ];
}
