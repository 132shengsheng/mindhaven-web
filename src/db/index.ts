import Dexie, { type Table } from 'dexie';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  cbtStage: 1 | 2 | 3 | 4; // 1: 倾听倾诉, 2: 捕获思维, 3: 检验偏差, 4: 重构行动
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  distortionTag?: string; // 识别出的认知偏差（如：非黑即白、灾难化等）
  cbtStage?: 1 | 2 | 3 | 4;
  createdAt: number;
}

export interface CBTDiary {
  id: string;
  eventTrigger: string;       // 触发情境
  negativeThought: string;    // 消极自动思维
  distortionTag?: string;     // 认知偏差标签
  rationalThought: string;    // 理性替代思维
  emotionScoreBefore: number; // 疏导前痛苦分 (0-100)
  emotionScoreAfter: number;  // 疏导后痛苦分 (0-100)
  createdAt: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

export class MindHavenDatabase extends Dexie {
  sessions!: Table<ChatSession>;
  messages!: Table<ChatMessage>;
  diaries!: Table<CBTDiary>;
  emergencyContacts!: Table<EmergencyContact>;

  constructor() {
    super('MindHavenDB');
    this.version(1).stores({
      sessions: 'id, createdAt, updatedAt',
      messages: 'id, sessionId, createdAt',
      diaries: 'id, createdAt',
      emergencyContacts: 'id, name',
    });
  }
}

export const db = new MindHavenDatabase();

// 初始化默认示例数据与默认紧急求助信息
export async function initDatabaseDefaults() {
  const contactCount = await db.emergencyContacts.count();
  if (contactCount === 0) {
    await db.emergencyContacts.bulkPut([
      {
        id: 'hotline-1',
        name: '全国心理危机干预热线',
        phoneNumber: '400-161-9995',
        relationship: '24小时官方免费援助',
      },
      {
        id: 'hotline-2',
        name: '北京心理危机研究与干预热线',
        phoneNumber: '010-82951332',
        relationship: '权威专业危机支持',
      },
      {
        id: 'hotline-3',
        name: '希望 24 热线（生命教育与危机干预）',
        phoneNumber: '400-161-9995',
        relationship: '全天候生命守护',
      },
    ]);
  }

  const sessionCount = await db.sessions.count();
  if (sessionCount === 0) {
    const initialSessionId = 'welcome-session';
    await db.sessions.put({
      id: initialSessionId,
      title: '初次相遇：温暖的倾听树洞',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cbtStage: 1,
    });

    await db.messages.put({
      id: 'welcome-msg',
      sessionId: initialSessionId,
      role: 'assistant',
      content: '你好，请在这里轻轻歇下脚步。在心潮港湾，你的每一缕情绪都将被郑重且温柔地接纳。你无需在此刻强撑坚强，无论是未被理解的委屈、盘旋心头的焦虑，还是难以言说的疲惫，都可以随时向我倾诉。今天过得如何？心间有什么事情正悄悄牵动着你吗？',
      cbtStage: 1,
      createdAt: Date.now(),
    });

    // 添加一条三栏日记教学示例
    await db.diaries.put({
      id: 'demo-diary-1',
      eventTrigger: '方案汇报时，主管指出了两处数据错误',
      negativeThought: '我怎么总是搞砸，我根本不配做这个岗位，大家都在看我笑话。',
      distortionTag: '灾难化思维 / 非黑即白',
      rationalThought: '被指出错误确实让人难堪，但这只是两处数据的核实问题，只要修正补充即可。主管批评的是数据本身，并不代表我这个人一无是处。一次失误不等于人生全盘失败。',
      emotionScoreBefore: 85,
      emotionScoreAfter: 35,
      createdAt: Date.now() - 86400000,
    });
  }
}