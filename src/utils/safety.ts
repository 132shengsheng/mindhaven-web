// 心理健康危机安全守门人（Safety Guardrails）

export interface CrisisCheckResult {
  isCrisis: boolean;
  level: 'none' | 'moderate' | 'critical';
  reason?: string;
  matchedPhrase?: string;
}

// 高危危机词汇与行为意图匹配正则（涵盖自残、轻生、毁灭性绝望倾向）
const CRITICAL_CRISIS_PATTERNS = [
  /想(去)?死/i,
  /自杀/i,
  /自残/i,
  /不想活(了)?/i,
  /活(着)?太累(了)?(，|,)?想解脱/i,
  /割腕/i,
  /跳楼/i,
  /安眠药.*死/i,
  /烧炭/i,
  /结束(这(一)?切|自己的生命|生命)/i,
  /离开这个世界/i,
  /准备后事/i,
  /遗书/i,
  /没有活下去的(意义|必要|勇气)/i,
  /人间不值得.*走/i,
  /自虐/i,
  /活着没意思.*死/i,
];

// 中度预警（重度无望感与情绪绝境，需要温暖托底与关注）
const MODERATE_CRISIS_PATTERNS = [
  /彻底绝望/i,
  /我毁了/i,
  /活着好痛苦/i,
  /活着没有任何意义/i,
  /全世界都抛弃我/i,
  /快要崩溃了/i,
];

/**
 * 实时危机意图识别：端侧零延迟毫秒级拦截
 */
export function checkCrisisIntent(text: string): CrisisCheckResult {
  if (!text || typeof text !== 'string') {
    return { isCrisis: false, level: 'none' };
  }

  const cleanText = text.trim();

  // 1. 优先检测最高危自伤/自杀意图
  for (const pattern of CRITICAL_CRISIS_PATTERNS) {
    const match = cleanText.match(pattern);
    if (match) {
      return {
        isCrisis: true,
        level: 'critical',
        reason: '检测到极端自伤或生命危机倾向，需要立即提供权威紧急心理援助',
        matchedPhrase: match[0],
      };
    }
  }

  // 2. 检测中度重度绝望与情绪崩溃
  for (const pattern of MODERATE_CRISIS_PATTERNS) {
    const match = cleanText.match(pattern);
    if (match) {
      return {
        isCrisis: false, // 不强行弹窗中断，但用于标记需要更温柔的对话策略
        level: 'moderate',
        reason: '用户处于高度绝望与心理负荷临界状态',
        matchedPhrase: match[0],
      };
    }
  }

  return { isCrisis: false, level: 'none' };
}

export interface CrisisHotline {
  name: string;
  phone: string;
  desc: string;
  available: string;
}

export const AUTHORITATIVE_HOTLINES: CrisisHotline[] = [
  {
    name: '全国心理危机干预热线',
    phone: '400-161-9995',
    desc: '面向全国公众的 24 小时免费心理援助与危机干预',
    available: '24 小时在线',
  },
  {
    name: '北京心理危机研究与干预中心',
    phone: '010-82951332',
    desc: '北京回龙观医院专业心理危机干预热线（免费专线 800-810-1117）',
    available: '24 小时在线',
  },
  {
    name: '中国心理危机与自杀干预热线',
    phone: '028-87577510',
    desc: '专业危机心理平复与倾听热线',
    available: '24 小时在线',
  },
  {
    name: '青少年心理咨询与关爱热线',
    phone: '12355',
    desc: '共青团中央青少年权益与心理辅导专线',
    available: '工作时间',
  },
];