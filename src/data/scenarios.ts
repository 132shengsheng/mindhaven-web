export interface ScenarioItem {
  id: string;
  category: 'work' | 'relationship' | 'self' | 'anxiety';
  categoryName: string;
  tag: string;
  icon: string;
  title: string;
  sub: string;
  distortion: string;
  emotionalLoad: number; // 0 - 100
  prompt: string;
  hint: string;
}

export const CATEGORIES = [
  { key: 'all', label: '全部心绪', icon: '✨' },
  { key: 'work', label: '职场与学业', icon: '💼' },
  { key: 'relationship', label: '人际与边界', icon: '👥' },
  { key: 'self', label: '自我与认同', icon: '🌱' },
  { key: 'anxiety', label: '焦虑与反刍', icon: '🌊' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export const SCENARIOS: ScenarioItem[] = [
  {
    id: 'work-criticism',
    category: 'work',
    categoryName: '职场与学业',
    tag: '职场内耗',
    icon: '💼',
    title: '方案被领导当面否定，整个人陷入自责与怀疑',
    sub: '脑海里不断回放批评细节，总觉得能力不行随时会被淘汰...',
    distortion: '灾难化思维 · 以偏概全',
    emotionalLoad: 88,
    prompt: '今天工作方案汇报被领导当面指出了好几个问题，语气比较严肃。我现在整个人陷在强烈的自责和无价值感里，脑子里一直反复出现“我能力太差了，我根本不配这个职位，迟早会被裁员”的想法。请陪我一起把客观事实和消极推测区分开，理性梳理当下的情绪。',
    hint: '区分“方案有待完善”与“自我全盘否定”'
  },
  {
    id: 'work-imposter',
    category: 'work',
    categoryName: '职场与学业',
    tag: '冒名顶替',
    icon: '🎭',
    title: '刚获晋升或接手要务，却深信自己只是运气好',
    sub: '害怕随时被所有人识破自己的“平庸”，时刻提心吊胆...',
    distortion: '贬低积极面 · 贴负面标签',
    emotionalLoad: 78,
    prompt: '最近我刚被安排负责一个核心项目，但我完全感受不到开心，反而时刻陷入恐慌，总觉得自己根本没有那么强，只是运气好蒙混过关了。我每天都提心吊胆，害怕哪天露馅让所有人失望。我想用苏格拉底式提问梳理一下自己的冒名顶替综合征（Imposter Syndrome）。',
    hint: '客观罗列过去的真实贡献与证据'
  },
  {
    id: 'rel-boundary',
    category: 'relationship',
    categoryName: '人际与边界',
    tag: '讨好与边界',
    icon: '👥',
    title: '因害怕冲突不敢拒绝，硬着头皮承担不属于自己的事',
    sub: '委屈迎合别人，事后又极度怨恨对方与懦弱的自己...',
    distortion: '读心术 · 应该句式',
    emotionalLoad: 82,
    prompt: '组里同事又把他未完成的杂事推给了我，我心里非常抗拒和委屈，但因为害怕场面尴尬或被孤立，我还是强颜欢笑答应了。现在我既对同事感到愤怒，又痛恨自己软弱无能。请帮我分析我心里的“拒绝即毁灭”信念，如何建立温和而坚定的心理边界？',
    hint: '打破“拒绝别人就会招致嫌弃”的非理性假定'
  },
  {
    id: 'rel-unanswered',
    category: 'relationship',
    categoryName: '人际与边界',
    tag: '过度解读',
    icon: '💬',
    title: '重要的人长时间未回消息，内心剧烈预演“感情破裂”',
    sub: '胸口发紧、坐立难安，反复查看聊天记录寻找自己做错的蛛丝马迹...',
    distortion: '个人化归因 · 情感推理',
    emotionalLoad: 90,
    prompt: '给很在乎的朋友/伴侣发了消息，好几个小时过去了对方一直没回，但我看到他在社媒有其他动态。我现在胸口堵得慌、心跳加速，控制不住地想“他肯定是对我厌烦了，我是不是哪句话说错了惹他生气了”。请帮我平息这种情感推理，客观检验这件事情。',
    hint: '探索除“针对我”之外的其他 5 种客观可能性'
  },
  {
    id: 'anxiety-procrastination',
    category: 'anxiety',
    categoryName: '焦虑与反刍',
    tag: '拖延瘫痪',
    icon: '⏳',
    title: '截止日期近在眼前，越焦虑越动弹不得，被内疚吞噬',
    sub: '坐在书桌前疯狂刷手机逃避，时间流逝与自责引发恶性循环...',
    distortion: '非黑即白 · 情绪推理',
    emotionalLoad: 94,
    prompt: '手头有一份非常重要的任务明天就要截止了，但我整个人陷入了“任务瘫痪”，坐在电脑前两个小时一个字也写不出来。我越焦虑就越忍不住刷手机逃避，随之而来的是强烈的罪恶感，觉得自己无药可救。请帮我拆解这个恐惧与拖延的死循环，哪怕带我从最微小的 1% 开始。',
    hint: '接纳“不完美起步”，降低启动心理门槛'
  },
  {
    id: 'anxiety-rumination',
    category: 'anxiety',
    categoryName: '焦虑与反刍',
    tag: '深夜反刍',
    icon: '🌙',
    title: '深夜躺在床上，脑海疯狂回放白天的“失误或尴尬发言”',
    sub: '身体极度疲惫但神经紧绷，不断设想“所有人都在暗中嘲笑我”...',
    distortion: '聚光灯效应 · 心理滤镜',
    emotionalLoad: 85,
    prompt: '现在是深夜，我身体很累但大脑依然处于警觉状态，反反复复在脑海中倒带白天开会时我说错的一句话，甚至放大每个人脸上的微表情。我总觉得全场的人都在内心觉得我不专业。请帮我运用心理学中的“聚光灯效应”，破除这种深夜反刍和思维滤镜。',
    hint: '他人对微小失误的注意力远低于当事人的想象'
  },
  {
    id: 'self-appearance',
    category: 'self',
    categoryName: '自我与认同',
    tag: '聚光灯效应',
    icon: '🪞',
    title: '身处公共场合总觉得别人在挑剔打量我的外貌体态',
    sub: '走路僵硬、呼吸不畅，随时怀疑自己显得笨拙滑稽...',
    distortion: '读心术 · 灾难化思维',
    emotionalLoad: 76,
    prompt: '每次走进电梯、走廊或人多的公开场合，我都感觉浑身不自在，总觉得周围所有人都在上下打量我，挑剔我的身材、发型或穿搭，甚至在心里评头品足。虽然我知道这很可能只是我的心理投射，但身体还是不由自主地紧绷。我想尝试理性检验一下这个担忧。',
    hint: '观察客观环境，将注意力由内转向外界具体事物'
  },
  {
    id: 'self-perfectionism',
    category: 'self',
    categoryName: '自我与认同',
    tag: '苛求完美',
    icon: '⚖️',
    title: '事情只要有一点瑕疵，就觉得全盘皆输没有意义',
    sub: '“要么做到极致100分，要么就是彻底失败”，常常苛责自己...',
    distortion: '非黑即白思维 · 严苛标准',
    emotionalLoad: 86,
    prompt: '我在做一件事情时，如果出现了一丁点不符合预期的纰漏，就会立刻陷入巨大的挫败感，脑子里就会冒出“既然不能做到完美，那这一切努力都毫无意义了”的念头，甚至想直接放弃。我想练习如何打破这种非黑即白的完美主义枷锁，允许灰度的存在。',
    hint: '练习 80 分的“足够好”理念，接纳过程的动态性'
  },
];
