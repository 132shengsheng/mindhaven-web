import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  Wind,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Feather,
  Quote,
  Volume2,
  VolumeX,
  BrainCircuit,
  Lightbulb
} from 'lucide-react';
import { soundTherapy } from '../utils/audio';
import { SCENARIOS, CATEGORIES, type CategoryKey } from '../data/scenarios';

interface LandingShowcaseProps {
  onStartChat: (initialPrompt?: string) => void;
  onOpenDiary: () => void;
  onOpenBreathing: () => void;
  onOpenCrisis: () => void;
}

const CBT_STAGES = [
  {
    step: '01',
    icon: '🌿',
    title: '倾听澄清',
    en: 'Empathize & Clarify',
    desc: '接纳并厘清困扰情境',
    detail: '无条件接纳当下的紧绷与脆弱，将主观情绪与客观事实剥离，建立安全信任场域。',
  },
  {
    step: '02',
    icon: '🔍',
    title: '捕获思维',
    en: 'Identify Distortion',
    desc: '定位消极自动念头',
    detail: '借助认知透镜，高敏捕获脑海深处的“非黑即白”、“灾难化推测”等自动化负面认知。',
  },
  {
    step: '03',
    icon: '💡',
    title: '理性检验',
    en: 'Reality Test',
    desc: '寻找客观依据与替代视角',
    detail: '运用苏格拉底式提问，审查消极信念的真实证据度，破除思维滤镜带来的恐慌。',
  },
  {
    step: '04',
    icon: '☀️',
    title: '重塑信念',
    en: 'Reframe & Balance',
    desc: '建立平衡替代信念',
    detail: '产出兼具温度与理性的新信念，量化心理负荷缓解分值，沉淀至本地认知手账。',
  },
];

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({
  onStartChat,
  onOpenDiary,
  onOpenBreathing,
  onOpenCrisis,
}) => {
  const [isPlayingRain, setIsPlayingRain] = useState(false);
  const [demoRelief, setDemoRelief] = useState(45);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');

  const toggleRainAudio = () => {
    if (isPlayingRain) {
      soundTherapy.stop();
      setIsPlayingRain(false);
    } else {
      soundTherapy.playRain();
      setIsPlayingRain(true);
    }
  };

  const filteredScenarios = selectedCategory === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto h-full relative z-10 selection:bg-[#4D7A68]/20">
      {/* 1. Hero 品牌主殿堂 (Grand Promotional Hero) */}
      <section className="relative px-6 sm:px-12 pt-14 pb-16 max-w-5xl mx-auto text-center">
        {/* 顶部尊贵胶囊微标 (Eyebrow Badge) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 border border-[#4D7A68]/25 shadow-[0_4px_16px_rgba(77,122,104,0.08)] mb-8 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#4D7A68] animate-pulse" />
          <span className="text-xs font-medium text-[#224337] tracking-tight">
            心理学循证疗法 × 端侧隐私计算 · CBT 认知重塑港湾
          </span>
          <span className="text-[10px] text-[#4D7A68] bg-[#EBF3EF] px-1.5 py-0.5 rounded font-mono font-medium">
            v1.0
          </span>
        </div>

        {/* 核心宣传标题 (Poetic Luxury Display Typography) */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-[#224337] tracking-tight leading-[1.18]">
            把心事放进港湾，
            <br />
            让情绪重归自洽与平和。
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed font-normal max-w-2xl mx-auto pt-2">
            在信息过载与焦虑重压的时代，为你筑造一座绝对私密、无批判、融合认知行为科学（CBT）与深林自然声学的身心庇护所。
          </p>
        </div>

        {/* 高阶行动号召按键组 (Hero CTA Group) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-8">
          <button
            onClick={() => onStartChat()}
            className="px-7 py-3.5 rounded-2xl bg-[#224337] hover:bg-[#1a352b] text-white text-sm font-medium shadow-[0_8px_24px_rgba(34,67,55,0.28)] hover:shadow-[0_12px_32px_rgba(34,67,55,0.35)] transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer group"
          >
            <span>立即开启倾诉对话</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenDiary}
            className="px-6 py-3.5 rounded-2xl bg-white/85 hover:bg-white text-stone-800 text-sm font-medium border border-white/90 hover:border-[#4D7A68]/30 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(77,122,104,0.08)] transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#4D7A68]" />
            <span>三栏认知重塑手账</span>
          </button>

          <button
            onClick={onOpenBreathing}
            className="px-5 py-3.5 rounded-2xl bg-white/60 hover:bg-white/90 text-stone-700 text-sm font-medium border border-stone-200/60 hover:border-stone-300 transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Wind className="w-4 h-4 text-[#4D7A68]" />
            <span>4-7-8 呼吸静心</span>
          </button>
        </div>

        {/* 信任徽标栏 (Trust Bar) */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D7A68]" />
            <span>端侧 IndexedDB 离线沙盒</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#4D7A68]" />
            <span>0 云端追踪 · 隐私完全自主</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Feather className="w-4 h-4 text-[#4D7A68]" />
            <span>认知行为科学 (CBT) 循证体系</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-[#4D7A68]" />
            <span>算法实时生成自然声学</span>
          </div>
        </div>

        {/* 2. 核心产品实机视窗预览与自然艺术展台 (Hero Visual Sanctuary & Interactive Sandbox) */}
        <div className="mt-14 relative rounded-3xl p-2 bg-gradient-to-b from-white/95 via-white/60 to-white/30 border border-white/80 shadow-[0_24px_64px_rgba(34,67,55,0.08)] max-w-4xl mx-auto overflow-hidden">
          {/* 自然晨雾禅意主图 Banner */}
          <div className="relative h-44 sm:h-60 rounded-[1.35rem] overflow-hidden group">
            <img
              src="/assets/hero_sanctuary.jpg"
              alt="MindHaven Sanctuary Haven"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
            />
            {/* 流光渐变蒙层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/30 to-black/20" />
            
            {/* 顶栏微光气泡 */}
            <div className="absolute top-3.5 left-4 sm:left-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-white/70 text-xs font-medium text-[#224337] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#4D7A68] animate-pulse" />
                晨雾松林 · 静谧心绪场域
              </span>
            </div>

            {/* 底栏意境标题 */}
            <div className="absolute bottom-3 left-4 sm:left-6 right-4 flex items-end justify-between">
              <div className="text-left">
                <span className="text-[10.5px] font-mono text-[#224337]/75 font-semibold tracking-wider uppercase">
                  BIOPHILIC SANCTUARY
                </span>
                <div className="text-base sm:text-xl font-serif text-[#224337] font-medium drop-shadow-xs">
                  “允许一切如其所是，在平静中找回生活的掌控感”
                </div>
              </div>
              <button
                onClick={() => onStartChat()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>进入体验</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 模拟实机交互沙盒 */}
          <div className="bg-[#FAF9F6] rounded-[1.35rem] p-5 sm:p-7 text-left space-y-5 mt-2 border border-stone-200/40">
            {/* 模拟顶栏 */}
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E07A5F]" />
                <span className="w-3 h-3 rounded-full bg-[#C99A5B]" />
                <span className="w-3 h-3 rounded-full bg-[#4D7A68]" />
                <span className="text-xs font-mono text-stone-400 ml-2">MindHaven CBT Interactive Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full font-medium">
                  🌿 阶段 3/4 · 理性检验与替代信念
                </span>
              </div>
            </div>

            {/* 对话流示例 */}
            <div className="space-y-4">
              {/* 用户气泡 */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-gradient-to-br from-[#224337] to-[#1a352b] text-[#FAF9F6] rounded-[20px_20px_4px_20px] px-5 py-3 text-xs sm:text-sm leading-relaxed shadow-sm">
                  今天方案被领导当众批评了，我感觉自己是个彻头彻尾的失败者，大家肯定都在背后笑话我。
                </div>
              </div>

              {/* 助手羊脂玉气泡 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#224337] flex items-center justify-center shrink-0 shadow-xs mt-1 border border-stone-200/60">
                  <Sparkles className="w-4 h-4 text-[#4D7A68]" />
                </div>
                <div className="bg-white/95 backdrop-blur-md rounded-[20px_20px_20px_4px] p-5 text-xs sm:text-sm text-stone-800 space-y-2.5 border border-white shadow-xs max-w-[90%]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-[#FCF7F0] text-[#73582A] border border-[#E8D9C0]">
                    <span>💡 捕获思维偏差：</span>
                    <span className="font-semibold">灾难化思维 / 读心术</span>
                  </div>
                  <p className="leading-relaxed text-stone-700">
                    听到严肃的批评确实会本能地让人紧绷甚至委屈，先轻呼一口气。让我们把<strong>“方案存在技术漏洞”</strong>与<strong>“你整个人是个失败者”</strong>区分开来。领导批评的是方案的客观数据，还是在否定你所有的付出？如果最好的朋友遇到同样情况，你会断定他是个彻底的失败者吗？
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-xs text-[#4D7A68]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D7A68]" />
                    <span>客观事实与灾难化情绪剥离 · 预期心理负荷减轻 -45 分</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 模拟输入条 */}
            <div className="p-3 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between shadow-2xs">
              <span className="text-xs text-stone-400 pl-2">说出此刻心里的紧绷、委屈或自我怀疑...</span>
              <button
                onClick={() => onStartChat()}
                className="px-4 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>进入完整对话</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 为什么是 CBT 认知重塑？(The 4-Step CBT Cognitive Flow) */}
      <section className="px-6 sm:px-12 py-16 bg-white/40 border-y border-[#224337]/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-medium text-[#4D7A68] tracking-widest uppercase">
              Scientific Methodology · 认知科学方法论
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-medium text-[#224337] tracking-tight">
              情绪不是由事件决定的，
              <br className="hidden sm:inline" />
              而是由我们对事件的解释决定的。
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              认知行为疗法（CBT）是当代国际公认对情绪困扰最具循证效果的心理学流派。MindHaven 将专业 CBT 临床咨询流程拆解为 4 步无缝心流：
            </p>
          </div>

          {/* 4 步阶梯流光卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CBT_STAGES.map((s, idx) => (
              <div
                key={idx}
                className="glass-sanctuary rounded-3xl p-6 space-y-3.5 hover:border-[#4D7A68]/40 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-mono font-semibold text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-md">
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-800 group-hover:text-[#224337] transition-colors">
                    {s.title}
                  </h3>
                  <span className="text-[10.5px] font-mono text-stone-400 block tracking-tight uppercase mt-0.5">
                    {s.en}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 四维治愈力 Bento Grid 展厅 (Core Superpowers Bento Showcase with Visual Assets) */}
      <section className="px-6 sm:px-12 py-20 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-[#4D7A68] tracking-widest uppercase">
            Four Core Capabilities · 四重治愈基石
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#224337] tracking-tight">
            专为个体深度自洽打造的工程杰作
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento 1: 实时共情对话 (7 cols) */}
          <div className="md:col-span-7 glass-sanctuary rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-xs hover:border-[#4D7A68]/30 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#4D7A68]" />
              </div>
              <h3 className="text-lg font-semibold text-[#224337]">
                流式 CBT 共情对话工作台
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                4 步认知阶段自适应推进，自动高敏识别 10+ 类思维滤镜偏差。每一次输出都充满无条件的接纳，随时一键提炼顿悟至手账。
              </p>
            </div>

            <div className="p-4 bg-white/85 rounded-2xl border border-stone-200/70 space-y-2 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-[#4D7A68]" />
                  苏格拉底式提问引导
                </span>
                <span className="text-[10px] text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-full font-medium">
                  零评判安全场
                </span>
              </div>
              <p className="text-stone-500 leading-relaxed italic">
                “‘如果这件事发生在五年后，它还会像今天这样致命吗？’—— 让我们一起用证据重新审视。”
              </p>
            </div>
          </div>

          {/* Bento 2: 4-7-8 呼吸静心仓 (5 cols) 配图 balance_stone.jpg */}
          <div className="md:col-span-5 glass-sanctuary rounded-3xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs hover:border-[#4D7A68]/30 transition-all overflow-hidden group">
            {/* 顶置摄影艺术卡片 */}
            <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-white/60 shadow-inner">
              <img
                src="/assets/balance_stone.jpg"
                alt="Mindful balance stones in misty forest"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#224337]/75 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-medium text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  🪨 心绪定石 · 迷走神经共振
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center">
                  <Wind className="w-4 h-4 text-[#4D7A68]" />
                </div>
                <h3 className="text-base font-semibold text-[#224337]">
                  4-7-8 迷走神经深度呼吸
                </h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                遵循哈佛医学院倡导的自律神经调节律动。配合纯 Web Audio 实时算法合成的轻柔细雨，无需下载任何外部音频。
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={toggleRainAudio}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPlayingRain
                    ? 'bg-[#224337] text-white shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/80 shadow-2xs'
                }`}
              >
                {isPlayingRain ? <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
                <span>{isPlayingRain ? '细雨白噪播放中（点击静音）' : '试听算法合成静谧细雨'}</span>
              </button>
            </div>
          </div>

          {/* Bento 3: Moleskine 三栏认知重塑手账 (6 cols) 配图 journal_desk.jpg */}
          <div className="md:col-span-6 glass-sanctuary rounded-3xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs hover:border-[#4D7A68]/30 transition-all overflow-hidden group">
            {/* 顶置摄影艺术卡片 */}
            <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-white/60 shadow-inner">
              <img
                src="/assets/journal_desk.jpg"
                alt="Mindful journal desk with dried flowers and tea"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#224337]/75 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-medium text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  📖 晨光书斋 · 自动化消极信念沉淀
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#4D7A68]" />
                </div>
                <h3 className="text-base font-semibold text-[#224337]">
                  Moleskine 灵动三栏重塑手账
                </h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                告别枯燥表单。客观事实、消极念头、理性替代信念，配合动态情绪负荷量表与一键导出，打造永恒的个人顿悟手账。
              </p>
            </div>

            <div className="p-3.5 bg-white/80 rounded-2xl border border-stone-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">负荷缓解互动模拟：</span>
                <span className="text-[11px] font-semibold text-[#224337] bg-[#EBF3EF] px-2 py-0.5 rounded-full">
                  缓解 -{demoRelief} 分
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={demoRelief}
                onChange={e => setDemoRelief(Number(e.target.value))}
                className="w-full accent-[#224337] cursor-pointer"
              />
            </div>
          </div>

          {/* Bento 4: 端侧 Local-First 绝对隐私 (6 cols) */}
          <div className="md:col-span-6 glass-sanctuary rounded-3xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs hover:border-[#4D7A68]/30 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#4D7A68]" />
              </div>
              <h3 className="text-lg font-semibold text-[#224337]">
                Local-First 端侧加密数据主权
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                所有倾诉对话与手账记录完全保存在浏览器本地 IndexedDB。无账号登录门槛、无云端追踪、支持全量 JSON 数据导出与彻底粉碎。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-3 bg-white/85 rounded-xl border border-stone-200/60 font-medium text-[#224337] shadow-2xs">
                100% 本地存储
              </div>
              <div className="p-3 bg-white/85 rounded-xl border border-stone-200/60 font-medium text-[#224337] shadow-2xs">
                0 云端留痕
              </div>
              <div className="p-3 bg-white/85 rounded-xl border border-stone-200/60 font-medium text-[#224337] shadow-2xs">
                一键随时导出
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 即刻沉浸解压区：心绪素材与场景灵感库 (Interactive Prompt Scenarios Sanctuary) */}
      <section className="px-6 sm:px-12 py-18 bg-white/50 border-y border-[#224337]/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2.5 max-w-xl mx-auto">
            <span className="text-xs font-mono font-medium text-[#4D7A68] tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4D7A68]" />
              Prompt Sanctuary · 心绪素材与场景灵感库
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#224337] tracking-tight">
              此刻的你，正因什么感到紧绷？
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              8 组深度贴近生活实景的 CBT 倾诉提示词，点击即可带入专属安全会话开启疏导：
            </p>

            {/* 分类筛选胶囊群 */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.key;
                const count = cat.key === 'all'
                  ? SCENARIOS.length
                  : SCENARIOS.filter(s => s.category === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#224337] text-white shadow-sm scale-105'
                        : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/60 hover:border-[#4D7A68]/30'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 场景卡片矩阵 (Scenario Cards Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 max-w-4xl mx-auto">
            {filteredScenarios.map(sc => {
              // 根据负荷数值选择状态条色彩
              const loadColor =
                sc.emotionalLoad >= 88
                  ? 'bg-rose-500'
                  : sc.emotionalLoad >= 80
                  ? 'bg-amber-500'
                  : 'bg-[#4D7A68]';

              return (
                <div
                  key={sc.id}
                  className="glass-sanctuary rounded-3xl p-5 sm:p-6 text-left hover:border-[#4D7A68]/40 hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-[0_12px_28px_rgba(77,122,104,0.12)] flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* 卡片顶栏：图标、类别、负荷指示器 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1.5 rounded-xl bg-[#EBF3EF] inline-block">{sc.icon}</span>
                        <div>
                          <span className="text-[11px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                            {sc.tag}
                          </span>
                        </div>
                      </div>

                      {/* 情绪负荷微标 */}
                      <div className="flex items-center gap-1.5 bg-white/90 border border-stone-200/60 px-2.5 py-1 rounded-full text-[10.5px]">
                        <span className="text-stone-400 font-mono">负荷</span>
                        <span className="font-semibold text-stone-700">{sc.emotionalLoad}%</span>
                        <span className={`w-2 h-2 rounded-full ${loadColor} animate-pulse`} />
                      </div>
                    </div>

                    {/* 标题与副标题 */}
                    <h4 className="text-sm sm:text-base font-semibold text-stone-800 group-hover:text-[#224337] transition-colors leading-snug">
                      {sc.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {sc.sub}
                    </p>

                    {/* 思维偏差标签 */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] bg-[#FCF7F0] text-[#73582A] border border-[#E8D9C0]/70 font-medium">
                      <Lightbulb className="w-3 h-3 text-[#C99A5B]" />
                      <span>思维滤镜：{sc.distortion}</span>
                    </div>

                    {/* 提示词引文盒 (Prompt Material Box) */}
                    <div className="mt-3 p-3 bg-white/75 rounded-2xl border border-stone-200/60 text-xs text-stone-600 leading-relaxed italic line-clamp-3">
                      “{sc.prompt}”
                    </div>
                  </div>

                  {/* 底部启动按键 */}
                  <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      💡 {sc.hint}
                    </span>

                    <button
                      onClick={() => onStartChat(sc.prompt)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs group-hover:shadow-sm active:scale-95 cursor-pointer shrink-0"
                    >
                      <span>带入倾诉</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. 斯多葛与认知哲学名言 (Philosophy Quote) */}
      <section className="px-6 sm:px-12 py-16 max-w-3xl mx-auto text-center space-y-4">
        <Quote className="w-8 h-8 text-[#4D7A68]/40 mx-auto" />
        <blockquote className="text-base sm:text-xl font-serif text-[#224337] leading-relaxed italic">
          “困扰人们的不是事物本身，而是人们对事物的观念与评价。”
        </blockquote>
        <cite className="text-xs font-mono text-stone-400 block tracking-wider uppercase">
          —— 爱比克泰德（Epictetus）· 古希腊斯多葛派哲学家
        </cite>
      </section>

      {/* 7. 优雅宣传页脚 (Promotional Footer) */}
      <footer className="px-6 sm:px-12 py-12 border-t border-stone-200/60 bg-white/40 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#224337] text-white flex items-center justify-center font-serif text-sm">
              M
            </div>
            <div>
              <div className="font-semibold text-stone-800">MindHaven 栖心港湾</div>
              <div className="text-[11px] text-stone-400">专属于一人的心理疏导与认知重塑空间</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenCrisis}
              className="text-[#C05638] hover:underline cursor-pointer"
            >
              24h 心理危机援助热线 (400-161-9995)
            </button>
            <span>·</span>
            <span className="text-stone-400">Local-First Architecture</span>
            <span>·</span>
            <span className="text-stone-400">© 2026 MindHaven</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
