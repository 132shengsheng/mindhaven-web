// 心理咨询与对话技术专业知识库数据模型

export interface TheorySchool {
  id: string;
  name: string;
  en: string;
  coreAssumption: string;
  mechanism: string;
  scenarios: string;
  representative: string;
  badgeColor: string;
}

export interface MicroTechnique {
  category: string;
  enCategory: string;
  items: Array<{
    name: string;
    enName: string;
    desc: string;
    example: string;
  }>;
}

export interface ClinicalCase {
  id: string;
  title: string;
  tag: string;
  subTag: string;
  clientBackground: string;
  therapeuticInsight: string;
  dialogue: Array<{
    speaker: 'client' | 'counselor';
    text: string;
    technique?: string;
  }>;
}

export interface TechniqueTemplate {
  phase: string;
  technique: string;
  template: string;
  rationale: string;
}

export interface AcademicDataset {
  name: string;
  institution: string;
  scale: string;
  description: string;
  linkOrCitation: string;
}

// 1. 五大主流治疗流派核心矩阵
export const THEORY_SCHOOLS: TheorySchool[] = [
  {
    id: 'cbt',
    name: '认知行为疗法',
    en: 'Cognitive Behavior Therapy (CBT)',
    coreAssumption: '决定情绪和行为的不是客观事件本身，而是我们对事件的认知评价（A-B-C 理论框架）。',
    mechanism: '识别消极自动思维、寻找客观相反证据、修正深层核心信念、行为激活实验。',
    scenarios: '抑郁心境、惊恐发作、职场焦虑、冒充者综合征、强迫观念',
    representative: '亚伦·贝克 (Aaron T. Beck), 朱迪斯·贝克 (Judith S. Beck)',
    badgeColor: 'bg-[#EBF3EF] text-[#224337] border-[#4D7A68]/30',
  },
  {
    id: 'humanistic',
    name: '人本主义疗法',
    en: 'Person-Centered Therapy',
    coreAssumption: '人生来具有自我实现的内在倾向与疗愈潜能，痛苦源于价值条件的内化导致自我经验不协调。',
    mechanism: '无条件积极关注 (Unconditional Positive Regard)、真诚一致、高敏感度深度共情。',
    scenarios: '自我迷茫、存在危机、人际自卑、内在羞耻感、价值感缺失',
    representative: '卡尔·罗杰斯 (Carl Rogers)',
    badgeColor: 'bg-[#FAF3E8] text-[#73582A] border-[#C99A5B]/30',
  },
  {
    id: 'psychodynamic',
    name: '心理动力学 / 精神分析',
    en: 'Psychodynamic Therapy',
    coreAssumption: '当下的症状与重复痛苦源于未觉察的潜意识冲突、早期客体关系以及自动化防御机制。',
    mechanism: '潜意识意识化、解析移情与阻抗、修通未完成的内在客体情结。',
    scenarios: '慢性空虚、长期关系重复受挫、强迫性重复、复杂性依恋创伤',
    representative: '西格蒙德·弗洛伊德 (Sigmund Freud), 梅兰妮·克莱因 (Melanie Klein)',
    badgeColor: 'bg-[#F2EDF8] text-[#553C7B] border-[#8D6CAE]/30',
  },
  {
    id: 'act',
    name: '接纳承诺疗法',
    en: 'Acceptance and Commitment Therapy (ACT)',
    coreAssumption: '痛苦是生命不可避免的组成部分，心理僵化往往源于认知融合与对不适体验的盲目回避。',
    mechanism: '认知解离 (Defusion)、接纳开放、身处当下、明确内在核心价值、践行承诺行动。',
    scenarios: '强迫反刍思维、慢性身体疼痛伴发焦虑、普遍性生活卡点',
    representative: '史蒂文·海斯 (Steven C. Hayes)',
    badgeColor: 'bg-[#E8F4F8] text-[#1E5669] border-[#4A90A4]/30',
  },
  {
    id: 'sfbt',
    name: '焦点解决短程治疗',
    en: 'Solution-Focused Brief Therapy (SFBT)',
    coreAssumption: '解决问题并不一定需要穷追深挖病因，关注来访者过往的“正向例外”与其内在天生拥有的资源。',
    mechanism: '奇迹提问 (Miracle Question)、量表评分法、寻找例外经验、微小可行动作。',
    scenarios: '阶段性决策瘫痪、应急适应不良、时间紧迫的即刻干预',
    representative: '史蒂夫·德·沙泽尔 (Steve de Shazer), 茵素·金·伯格 (Insoo Kim Berg)',
    badgeColor: 'bg-[#FDF2E9] text-[#783E19] border-[#DC7633]/30',
  },
];

// 2. 咨询师核心微技术谱系
export const MICRO_TECHNIQUES: MicroTechnique[] = [
  {
    category: '倾听与探索 (Listening & Exploration)',
    enCategory: '建联与情绪同调',
    items: [
      {
        name: '最小鼓励语 (Minimal Encouragers)',
        enName: 'Minimal Encouragers',
        desc: '通过微小简短的言语及肢体信号，表达专注与陪伴，不打断来访者的心流表达。',
        example: '“嗯，我在听”、“是的，请继续说”、“慢一点，不着急”',
      },
      {
        name: '释义与复述 (Paraphrasing)',
        enName: 'Paraphrasing',
        desc: '用咨询师自己的话简明重述来访者叙述的事实核心，以核实信息并让对方感到被准确听懂。',
        example: '“所以听起来，昨天会议上发生的事情是，老板在没有事先沟通的情况下更换了负责人，是这样吗？”',
      },
      {
        name: '情感反映 (Reflecting Feeling)',
        enName: 'Reflecting Feeling',
        desc: '穿透表面言语，精准命名并镜映出言辞背后那层细腻的情绪颗粒度与主观体验。',
        example: '“听着你刚才的停顿，我感受到整件事带给你的不仅仅是疲惫，更多的是一种深沉的‘委屈与不被看见’。”',
      },
    ],
  },
  {
    category: '澄清与深化 (Clarifying & Deepening)',
    enCategory: '探索盲区与解构问题',
    items: [
      {
        name: '开放式提问 (Open Questions)',
        enName: 'Open Questions',
        desc: '避免非黑即白的封闭回答，赋予来访者广阔的觉察与展开探索空间。',
        example: '“当你脑海中冒出那个念头时，你身体里最明显的感受是什么？”',
      },
      {
        name: '问题外化技术 (Externalizing)',
        enName: 'Externalizing the Problem',
        desc: '将“人”与“问题”剥离，帮助来访者不再把自己等同于问题本身。',
        example: '“如果把最近一直纠缠你的‘焦虑’看作一个不请自来的怪兽，它通常在什么时候跳出来？”',
      },
      {
        name: '正常化脱敏 (Normalization)',
        enName: 'Normalization',
        desc: '通过普及心理规律，降低来访者的病耻感与自责孤立感。',
        example: '“在连续承受这半年的重压之下，任何一个身心健全的人产生想要逃离的冲动，都是完全符合人性的生理保护反应。”',
      },
    ],
  },
  {
    category: '认知与行动干预 (Restructuring & Action)',
    enCategory: '苏格拉底反思与微步落地',
    items: [
      {
        name: '苏格拉底式审问 (Socratic Questioning)',
        enName: 'Socratic Questioning',
        desc: '不生硬说教，以提问为明镜，引导来访者主动发现既有念头的漏洞与客观反例。',
        example: '“支持‘你注定一事无成’这一结论的客观事实有哪些？那么反对这个结论、证明你曾跨过难关的事实又有哪些？”',
      },
      {
        name: '温和面质 (Gentle Confrontation)',
        enName: 'Confrontation',
        desc: '温柔而敏锐地向来访者指出其言行、不同陈述或理想与现实之间的张力断层。',
        example: '“你一方面告诉我你非常渴望被大家喜欢，但另一方面每当大家邀请你时你都会下意识找借口拒绝，我们能看看这背后的担心吗？”',
      },
      {
        name: '行为激活微步阶梯 (Micro Behavioral Activation)',
        enName: 'Behavioral Activation',
        desc: '打破行动瘫痪，将宏大目标拆解为毫无阻力、1% 即可达成的身体微动作。',
        example: '“我们今天不谈什么重新振作的大计划，只选一件最微小的事：比如只是在床沿坐直深呼吸一分钟，或者喝半杯温水，你觉得哪一个更轻松？”',
      },
    ],
  },
];

// 3. 临床常见 6 大核心议题对话语料库（真实微观逐字稿）
export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'depression-paralysis',
    title: '抑郁心境与行动瘫痪',
    tag: '情绪接纳 · 行为激活',
    subTag: '行为阻抗与内在鞭挞',
    clientBackground: '来访者连续两周闭门不出，房间杂乱堆积，深陷自我厌恶、无力与行动瘫痪之中。',
    therapeuticInsight: '抑郁状态下的“躺着不动”往往是大脑在极度耗竭下的自我休眠保护。咨询师通过“重感冒”隐喻卸除道德自责，以 1% 的极低门槛微动作重启能动性。',
    dialogue: [
      {
        speaker: 'client',
        text: '这一周我又把生活过砸了。除了点外卖和上厕所，我几乎都在床上躺着刷手机。看着屋子乱成一团，我特别恨自己，觉得我就是个没用的废物。',
      },
      {
        speaker: 'counselor',
        text: '听上去你这一周都在承受双重折磨：身体上像被强力胶黏在床上动弹不得；心里还在一刻不停地拿着鞭子抽打自己，说“你怎么这么没用”，是吗？',
        technique: '双重痛苦命名 · 隐喻反映',
      },
      {
        speaker: 'client',
        text: '（叹气）对，别人都在正常工作、生活，只有我连起床都做不到，我越想越觉得自己没救了。',
      },
      {
        speaker: 'counselor',
        text: '如果现在你的好朋友生了重感冒，发烧到 39 度躺在床上起不来，你会走过去对他说“你怎么这么懒，你就是个废物”吗？',
        technique: '双标反照法 (Double Standard)',
      },
      {
        speaker: 'client',
        text: '当然不会，他生病了，身体需要休息啊。',
      },
      {
        speaker: 'counselor',
        text: '那你有没有想过，你现在的心灵和大脑也正处在一场严重的“重感冒”里？当身体能量见底的时候，“躺着不动”其实是生理启动的紧急保护。我们能不能试着把手里的鞭子放下五分钟，先看看这个疲惫不堪的自己？',
        technique: '正常化解构 · 慈悲唤醒',
      },
      {
        speaker: 'client',
        text: '……但我总得做点什么吧，不然事情只会越来越糟。',
      },
      {
        speaker: 'counselor',
        text: '做事情是为了照顾自己，而不是为了惩罚自己。如果我们今天不谈任何宏大计划，只找一件微小到不可思议的事——比如只是坐在床边把脚踩在地上感受一分钟地面，或者喝半杯温水，你觉得哪一个对现在的你来说稍微轻松一点？',
        technique: '行为激活微步法 (Micro-steps)',
      },
    ],
  },
  {
    id: 'catastrophic-anxiety',
    title: '灾难化思维与失控焦虑',
    tag: '去灾难化 · 生理着陆',
    subTag: '职场汇报应激与躯体化',
    clientBackground: '重要汇报前夕出现严重躯体化焦虑反应（心悸、失眠、胃痛、手抖），认定未来必然一败涂地。',
    therapeuticInsight: '将大脑的恐惧剧本与客观现实剥离，先通过身体着陆平息交感神经过度激活，再以苏格拉底提问验证既往成功经验并建立 B 计划。',
    dialogue: [
      {
        speaker: 'client',
        text: '下周一要向公司高层汇报，我这几天整夜失眠胃痛。我总觉得到时我一定会卡壳忘词，然后所有人都会用异样的眼光看我，老板会对我很失望，我的职业生涯就全完了。',
      },
      {
        speaker: 'counselor',
        text: '你的大脑正在为你编织一个极度恐怖的剧本，而且它在极力说服你：这个剧本百分之百会变成现实。我们先感受一下，当你想到“职业生涯彻底完了”时，身体哪里最难受？',
        technique: '认知解离 · 躯体觉察',
      },
      {
        speaker: 'client',
        text: '胸口特别闷，喘不上气，手一直在发抖。',
      },
      {
        speaker: 'counselor',
        text: '好，我们先花 30 秒深吸一口气，把脚掌稳稳踩在地上，感受地面的支撑……慢慢吐气……现在我们回到理性层面：在你以前的经历中，有没有过上台紧张的经历？',
        technique: '生理着陆技术 (Grounding)',
      },
      {
        speaker: 'client',
        text: '有，上季度汇报也紧张得要命。',
      },
      {
        speaker: 'counselor',
        text: '当时发生了最坏的结果吗？忘词卡壳了多久？',
        technique: '历史经验检验',
      },
      {
        speaker: 'client',
        text: '其实中间卡了大概十秒钟，我翻了下提纲又接上了，后半段讲得还挺顺。老板最后还说数据部分准备得很细。',
      },
      {
        speaker: 'counselor',
        text: '你看，即便出现了你害怕的“小卡壳”，现实也没有走向“彻底完蛋”。如果下周一真的出现了停顿十几秒，你有什么实际的应急办法吗？',
        technique: '去灾难化与现实检验',
      },
      {
        speaker: 'client',
        text: '我可以笑一下，说“不好意思我喝口水调整一下”，然后再看一眼手卡。',
      },
      {
        speaker: 'counselor',
        text: '非常棒，这是完全职业且体面的应对方式。下次当大脑再跳出来大喊“你全完了”的时候，试着告诉它：“谢谢你的善意提醒，但我有我的 B 计划”。',
        technique: '安全掌控感赋能',
      },
    ],
  },
  {
    id: 'imposter-syndrome',
    title: '冒充者综合征与完美主义',
    tag: '内在批判者 · 认知解离',
    subTag: '晋升后恐慌与冒牌感',
    clientBackground: '职场晋升后毫无成就感，长期担心“被拆穿”，在高度防御与冒牌恐惧中筋疲力尽。',
    therapeuticInsight: '审视来访者内心苛刻的非人化完美标准，将“全知全能的超级计算机”标尺还原为有血有肉的真实人类，重塑核心自我效能感。',
    dialogue: [
      {
        speaker: 'client',
        text: '虽然上个月我升职成了主管，但我一点都不开心，反而更恐慌了。我觉得完全是因为当时另外两个人离职，名额才顺延给我的。手下的人水平都比我强，我每天上班都在演戏，生怕哪天他们发现我其实什么都不懂。',
      },
      {
        speaker: 'counselor',
        text: '所以你感觉自己像是一个侥幸混进专业交响乐团的门外汉，手里拿着假乐器假装在拉琴，时刻担心当众被揭穿，是这种感觉吗？',
        technique: '意象镜映与情感共振',
      },
      {
        speaker: 'client',
        text: '对！就是这种感觉！我觉得我的每一个成就都是假的、是靠运气偷来的。',
      },
      {
        speaker: 'counselor',
        text: '在你心里似乎有一把严苛的标尺：一个真正的“称职主管”应该是什么样子的？',
        technique: '挖掘不合理信念核心',
      },
      {
        speaker: 'client',
        text: '应该所有技术问题都能秒答，永远有清晰的战略，下属犯错能完全兜底，没有任何弱点。',
      },
      {
        speaker: 'counselor',
        text: '这个标准听起来不像是一个人，更像是一台全知全能的超级计算机。在这个标准面前，世界上谁能不是“冒牌货”呢？如果一个优秀管理者的本质不是“个人技术最强”，而是“懂得把合适的人放在合适位置、凝聚团队”，你觉得你做过哪些体现了这点的事？',
        technique: '重构定义 · 寻找反例',
      },
      {
        speaker: 'client',
        text: '……上次跨部门扯皮，是我主动去协调，帮团队争取到了两周缓冲时间的。',
      },
      {
        speaker: 'counselor',
        text: '这需要极高的情商与组织协调力，这绝不是“运气”，而是你实打实的个人能力。是什么让你习惯性地抹杀自己的贡献，只盯着那些你不完美的地方？',
        technique: '探寻防御机制源头',
      },
    ],
  },
  {
    id: 'anxious-attachment',
    title: '亲密关系焦虑抓取',
    tag: '恐惧探索 · 安全依恋',
    subTag: '未回消息引发连环恐慌',
    clientBackground: '伴侣未及时回复消息即引发剧烈恐慌与抓取行为（夺命连环 call），事后陷入自责。',
    therapeuticInsight: '愤怒背后隐藏着极度脆弱的“被抛弃恐惧”。将控制性攻击行为重新翻译为对安全感的呼唤，引导自我安抚而非向外施压。',
    dialogue: [
      {
        speaker: 'client',
        text: '昨晚他又加班到很晚，发消息两三个小时都不回。我给他连打了 7 个电话，最后通了我忍不住对他大吼大叫。我知道我不该发疯，但我就是忍不住。如果他心里有我，回个“在忙”能花几秒钟？',
      },
      {
        speaker: 'counselor',
        text: '在那两三个小时没收到消息的空白里，你的内心世界经历了怎样的一场风暴？最底层的那个声音在说什么？',
        technique: '下行箭头技术 (Downward Arrow)',
      },
      {
        speaker: 'client',
        text: '刚开始是烦躁，后来就变成恐慌……我觉得他肯定是不在乎我了，或者厌烦我了，我甚至觉得他可能在跟别人约会。',
      },
      {
        speaker: 'counselor',
        text: '所以当对方处于未连接状态时，你的内心迅速被“被抛弃、被冷落”的恐惧淹没。为了阻止这种恐惧，身体启动的应激反应是——拼命打电话，用愤怒去质问他，对吗？',
        technique: '功能性行为分析',
      },
      {
        speaker: 'client',
        text: '对，只有听到他的声音，甚至哪怕是吵架，我才能确认他还在。',
      },
      {
        speaker: 'counselor',
        text: '这种“愤怒”就像警报器，它背后真正想喊出的话其实是“我太害怕失去你了，请让我确认我还是安全的”。但遗憾的是，当你把恐惧包装成愤怒砸向对方时，对方感受到的往往是窒息和控制，于是他更想逃，这又反过来坐实了你的恐惧。',
        technique: '恶性循环模式解析',
      },
      {
        speaker: 'client',
        text: '……确实，他昨晚跟我说跟我在一起太累了。那我到底该怎么办？',
      },
      {
        speaker: 'counselor',
        text: '下次当警报器再次拉响时，我们先不去抓手机。试着把手掌轻轻覆在胸口上，对自己说：“那个害怕被丢下的小孩又跑出来了，但我现在是成年人了，即便他两小时没回消息，我依然是完整而安全的。”',
        technique: '内在小孩安抚 · 自我安顿',
      },
    ],
  },
  {
    id: 'family-emotional-blackmail',
    title: '原生家庭与情感勒索',
    tag: '课题分离 · 必要内疚',
    subTag: '孝道道德重负与边界确立',
    clientBackground: '父母以健康、孝道为名强令其放弃热爱的大城市工作，来访者深陷内疚泥潭动弹不得。',
    therapeuticInsight: '阿德勒心理学“课题分离”理论的典型应用：厘清“爱父母”与“放弃人生自主权”的本质区别，帮助来访者承受成长的“必要内疚”。',
    dialogue: [
      {
        speaker: 'client',
        text: '我妈要求我必须回老家考公务员，她说“你在大城市打拼有什么用？我和你爸老了生病谁管？你就是个自私的白眼狼”。其实我非常喜欢现在设计师的工作，但如果我不回去，内心的愧疚感几乎要把我压垮了。',
      },
      {
        speaker: 'counselor',
        text: '妈妈的话就像是一把沉重的道德枷锁，套在了你“追求自己人生”的愿望上。在你的内心逻辑里，如果不按父母的意愿生活，等于什么？',
        technique: '核心信念挖掘',
      },
      {
        speaker: 'client',
        text: '等于我是个坏女儿，伤害了他们。',
      },
      {
        speaker: 'counselor',
        text: '我们尝试区分两件事：第一件事是，你爱父母、希望他们在生病时得到妥善照顾；第二件事是，放弃自己的职业和热爱，完全按照他们的剧本生活。这两件事在本质上是一回事吗？',
        technique: '概念解耦与课题分离',
      },
      {
        speaker: 'client',
        text: '在他们眼里就是一回事。',
      },
      {
        speaker: 'counselor',
        text: '那在你的眼里呢？当他们感到痛苦和愤怒时，是因为你真的在故意伤害他们，还是因为他们无法接纳“你是一个拥有独立思想的成年人，而不是他们的附属品”？',
        technique: '责任归属澄清',
      },
      {
        speaker: 'client',
        text: '……是因为我没按照他们的剧本走。可看到我妈掉眼泪，我就觉得自己罪不可赦。',
      },
      {
        speaker: 'counselor',
        text: '这种内疚感很真实，但健康的独立往往必须伴随着某种“必要的内疚”。如果你为了不让他们掉眼泪而妥协回去，用整个人生的幸福去换取他们的满意，五年后、十年后，你心里会对他们产生什么样的情感？',
        technique: '未来长远推演',
      },
      {
        speaker: 'client',
        text: '（沉默很久）怨恨。我会非常恨他们毁了我的一生。',
      },
      {
        speaker: 'counselor',
        text: '是的。委曲求全从来不会带来真正的爱与和谐，它只会滋生隐秘的怨恨。建立边界不是切断爱，而是用健康成熟的方式去爱：“我很爱你们，但我有我的人生要过。”',
        technique: '成熟爱与边界重构',
      },
    ],
  },
  {
    id: 'intrusive-thoughts-ocd',
    title: '强迫反刍与侵入性思维',
    tag: '接纳承诺 ACT · 白熊效应',
    subTag: '荒谬伤害念头引发道德恐慌',
    clientBackground: '脑海中频繁跳出伤害他人的可怕念头，因害怕自己“变坏”而反复焦虑自责与监视大脑。',
    therapeuticInsight: '“你不是你的想法”。道德感极高的人最容易被随机的怪诞念头绑架。通过“粉色北极熊”实验破除思维控制迷思，学会以超然观察者视角接纳脑内杂音。',
    dialogue: [
      {
        speaker: 'client',
        text: '咨询师，我最近快被折磨疯了。走在路上，我脑子里会突然冒出一个可怕的念头：“如果我把迎面走来的人推到马路中间会怎么样？”我根本不想害人，我怎么会有这么邪恶恐怖的念头？我越想把它压下去，它出现得越频繁，我是不是有潜在的暴力倾向？',
      },
      {
        speaker: 'counselor',
        text: '先停一下，听我说：你不是你的想法。大脑偶尔产生可怕或怪诞的念头，并不等于你是一个坏人，更不代表你会付诸行动。',
        technique: '认知解离核心声明',
      },
      {
        speaker: 'client',
        text: '真的吗？可是如果我没问题，为什么偏偏会冒出这个想法？',
      },
      {
        speaker: 'counselor',
        text: '人类的大脑每天会产生几万个随机思维碎片，包括大量的荒谬与怪诞念头。区别在于，一般人觉得“太荒唐了”就滑过去了；而你是一个道德感非常高的人，当你捕捉到这个念头时，你被它吓坏了，你立刻警惕地想去掐死它。但心理学上有一个著名的实验：“千万不要想房间里有一只粉色的北极熊”，你现在脑子里出现的是什么？',
        technique: '白熊效应去污名化',
      },
      {
        speaker: 'client',
        text: '一只粉色的熊。',
      },
      {
        speaker: 'counselor',
        text: '对。你越是严厉地监视大脑“不要想”，大脑就越会把它放在聚光灯下。那只是神经元偶然放电产生的脑内杂音而已。下次这个画面再跳出来时，不要跟它辩论，也不要试图压制它。你只要退后一步，像看着窗外的落叶一样看着它，心里对自己说：“哦，瞧，我的大脑又在播放那部怪诞的悬疑短片了，它只是一个杂音，我不用理会它。”然后继续走你的路。',
        technique: 'ACT 乘客隐喻与接纳承诺',
      },
    ],
  },
];

// 4. 咨询师标准化微技术话术模板库
export const TECHNIQUE_TEMPLATES: TechniqueTemplate[] = [
  {
    phase: '建联与倾听',
    technique: '开放探索',
    template: '“在今天的时间里，你最想把注意力放在哪个让你感觉最沉重、最耗神的地方？”',
    rationale: '将控制权还给来访者，建立安全平等的合作联盟。',
  },
  {
    phase: '建联与倾听',
    technique: '情感反映',
    template: '“听起来整件事让你感到的不仅是疲惫，更多的是一种深沉的‘不被理解与委屈’，是这样吗？”',
    rationale: '精准命名情绪，使未被消化的感受被觉察和容器化。',
  },
  {
    phase: '建联与倾听',
    technique: '正常化脱敏',
    template: '“换作任何一个人经历了你过去这半年的高压与波折，产生这种想要逃跑的冲动都是完全符合人性的生理保护反应。”',
    rationale: '剥离病耻感与自责，建立对脆弱的慈悲接纳。',
  },
  {
    phase: '澄清与重构',
    technique: '客观证据审视',
    template: '“我们来看看，支持你得出‘自己彻底完蛋了’这个结论的客观证据有哪些？相反的反例证据呢？”',
    rationale: '打破情绪化推理，引导理性中立的现实检验。',
  },
  {
    phase: '澄清与重构',
    technique: '双标反照法',
    template: '“如果此时你的挚友坐在你面前跟你倾诉同样的失误，你会用同样苛责无情的话去评价他吗？”',
    rationale: '借助他人视角激活内在关怀系统，打破对自我的过度苛求。',
  },
  {
    phase: '澄清与重构',
    technique: '奇迹提问 (SFBT)',
    template: '“如果今晚睡梦中发生了一个奇迹，困扰你的问题完全解决了。明早醒来时，你注意到的第一个不同之处会是什么？”',
    rationale: '绕过问题阻抗，直击内在向往的解决方案图景。',
  },
  {
    phase: '阻抗与深化',
    technique: '聚焦当下躯体体验',
    template: '“我注意到，每当你刚要聊到那件事的时候，你的呼吸就会变浅，身体也会向后缩，我们能在当下的这个停顿里待一会儿吗？”',
    rationale: '身体记忆往往比言语更快揭示深层防御机制。',
  },
  {
    phase: '阻抗与深化',
    technique: '阻抗外化接纳',
    template: '“你现在感到‘说了也没用’的这种防御心，其实多年来一直在默默保护你不再受到新失望的伤害，对吗？”',
    rationale: '不正面冲撞阻抗，而是感激阻抗过往的保护功能。',
  },
  {
    phase: '赋能与行动',
    technique: '微步行为激活 (1%)',
    template: '“我们不看终点还有多远，如果今天只要迈出 1% 的微小动作，对你来说最没有心理负担的一步是什么？”',
    rationale: '降低行动摩擦力，从微小胜任感中恢复能动性。',
  },
  {
    phase: '赋能与行动',
    technique: '结案赋权确认',
    template: '“回看我们刚开始探讨时你的状态，再看看今天你分析问题的方式，你觉得你自己身上最大的变化是什么？”',
    rationale: '将疗愈的功劳归还于来访者自身，巩固心理弹性。',
  },
];

// 5. 伦理红线与危机干预 SOP (C-SSRS 简化逻辑)
export const CRISIS_SOP = {
  confidentialityExceptions: [
    { title: '即刻自杀/自残风险', desc: '来访者表达了明确、即将付诸行动的自杀或严重自残倾向。' },
    { title: '伤害他人风险', desc: '来访者明确表达了伤害具体特定对象的意图或计划。' },
    { title: '侵害弱势群体', desc: '涉及正在发生的虐待儿童、老人或缺乏自我保护能力的人士。' },
    { title: '法律法定要求', desc: '司法机关出具合法法定手续调取档案。' },
  ],
  cssrsSteps: [
    {
      step: 'Step 1: 念头探寻 (Ideation)',
      question: '“最近在最痛苦绝望的时候，脑海里是否浮现过‘不如死了算了’或不再醒来的念头？”',
      aim: '评估是否存在被动自杀意念',
    },
    {
      step: 'Step 2: 意图澄清 (Intent)',
      question: '“当你想到这个念头时，你内心是真的想结束生命，还是渴望停止现在的痛苦？”',
      aim: '区分“想要解脱痛苦”与“真实自杀愿望”',
    },
    {
      step: 'Step 3: 计划与方式 (Plan & Means)',
      question: '“你脑海中是否有过具体的方式？是否设想过时间、地点或准备过相关物品？”',
      aim: '识别危险等级，判断是否具备致死手段与计划',
    },
    {
      step: 'Step 4: 保护性因素与安全计划 (Safety Plan)',
      question: '“在那些最痛苦的关头，是什么力量、回忆或牵挂让你依然坚持到了今天？”',
      aim: '激活保护性锚点，制定安全承诺，移交监护人与专业危机热线 (400-161-9995)',
    },
  ],
};

// 6. 学术数据集与权威专著索引
export const ACADEMIC_DATASETS: AcademicDataset[] = [
  {
    name: 'PsyQA',
    institution: '清华大学交互式 AI 实验室 (CoAI)',
    scale: '22,000+ 问答对',
    description: '包含心理咨询师专业回复与多维度策略标签（共情、解释、提问、建议等）。',
    linkOrCitation: 'GitHub: thu-coai/PsyQA',
  },
  {
    name: 'SoulChatCorpus',
    institution: '华中师范大学',
    scale: '百万级高质量多轮对话',
    description: '专家引导的高质量中文多轮心理咨询对话语料库，适合微调对话模型。',
    linkOrCitation: 'GitHub: scutcyr/SoulChat',
  },
  {
    name: 'CPsyCoun / CPDR',
    institution: '国内心理科研联合团队',
    scale: '深度多轮全流程咨询',
    description: '贴近真实长程咨询，涵盖建联、探索、认知干预与结案评估。',
    linkOrCitation: 'ACL / CPsyCoun 论文与代码仓',
  },
  {
    name: 'ESConv',
    institution: '清华大学 CoAI (ACL 2021)',
    scale: '1,000+ 多轮对话 / 30k+ 策略标注',
    description: '严格遵循情绪支持对话三阶段（探索-理解-行动），句级策略极细粒度标注。',
    linkOrCitation: 'GitHub: thu-coai/ESConv',
  },
  {
    name: 'CounselChat',
    institution: '国际心理专家社区',
    scale: '数千条认证治疗师问答',
    description: '国际持牌心理治疗师的精炼回答，主题分类清晰，极具循证参考价值。',
    linkOrCitation: 'Hugging Face: nbertagnolli/counsel-chat',
  },
];
