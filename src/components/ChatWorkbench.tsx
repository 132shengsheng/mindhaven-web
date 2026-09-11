import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Send,
  Sparkles,
  BookOpen,
  RefreshCw,
  Wind,
  CheckCircle2,
  HelpCircle,
  X,
  Lightbulb,
  ArrowRight,
  Volume2,
  VolumeX,
  Copy,
  Check,
  GraduationCap,
  ChevronDown,
  MessageSquare,
  ShieldAlert,
  FileText,
  User,
  Bot,
  Layers,
} from 'lucide-react';
import { db, type ChatMessage } from '../db';
import { streamAIChat, SCHOOL_PERSPECTIVES } from '../services/ai';
import { checkCrisisIntent } from '../utils/safety';
import { SCENARIOS, CATEGORIES, type CategoryKey } from '../data/scenarios';
import {
  THEORY_SCHOOLS,
  MICRO_TECHNIQUES,
  CLINICAL_CASES,
  TECHNIQUE_TEMPLATES,
  CRISIS_SOP,
  type ClinicalCase,
} from '../data/knowledgeBase';
import { soundTherapy } from '../utils/audio';

interface ChatWorkbenchProps {
  currentSessionId: string;
  onTriggerCrisis: (phrase?: string) => void;
  onExportToDiary: (event: string, thought: string, rational?: string) => void;
  onOpenBreathing?: () => void;
}

const CBT_STAGES_INFO = [
  {
    stage: 1,
    title: '倾听接纳',
    en: 'Empathize',
    icon: '🌿',
    desc: '温柔接纳当下情绪，厘清具体发生的困扰情境',
    guide: '写下让你感到紧绷或难过的事实，无需自责，这里是绝对安全的空间。',
  },
  {
    stage: 2,
    title: '捕获思维',
    en: 'Identify',
    icon: '🔍',
    desc: '捕捉脑海深处悄然涌现的消极自动化念头',
    guide: '注意脑海中的“第一反应”：是不是出现了绝对化、灾难化的念头？',
  },
  {
    stage: 3,
    title: '理性检验',
    en: 'Examine',
    icon: '💡',
    desc: '寻找客观中立的证据，辨别认知滤镜偏差',
    guide: '问问自己：这个最坏的想法有 100% 的事实支撑吗？是否存在其他可能性？',
  },
  {
    stage: 4,
    title: '重塑信念',
    en: 'Reframe',
    icon: '☀️',
    desc: '构建兼顾理性与温度的替代平衡思维',
    guide: '如果好友遇到同样处境，你会如何温和而客观地鼓励他？',
  },
];

export const ChatWorkbench: React.FC<ChatWorkbenchProps> = ({
  currentSessionId,
  onTriggerCrisis,
  onExportToDiary,
  onOpenBreathing,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showStageGuide, setShowStageGuide] = useState(false);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<CategoryKey>('all');
  const [isRainActive, setIsRainActive] = useState(soundTherapy.isPlaying);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // 网页对话内嵌心理咨询知识库状态
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);
  const [kbTab, setKbTab] = useState<'techniques' | 'cases' | 'templates' | 'schools' | 'crisis'>('techniques');
  const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
  const [showSchoolMenu, setShowSchoolMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取当前会话详情与消息列表
  const session = useLiveQuery(() => db.sessions.get(currentSessionId), [currentSessionId]);
  const messages = useLiveQuery(
    () =>
      db.messages
        .where('sessionId')
        .equals(currentSessionId)
        .sortBy('createdAt'),
    [currentSessionId]
  ) || [];

  const [activeSchoolId, setActiveSchoolId] = useState<string>(session?.school || 'cbt');

  useEffect(() => {
    if (session?.school) {
      setActiveSchoolId(session.school);
    }
  }, [session?.school]);

  const handleSelectSchool = async (schoolKey: string) => {
    setActiveSchoolId(schoolKey);
    setShowSchoolMenu(false);
    await db.sessions.update(currentSessionId, { school: schoolKey, updatedAt: Date.now() });
  };

  const currentStage = session?.cbtStage || 1;
  const activeStageInfo = CBT_STAGES_INFO.find(s => s.stage === currentStage) || CBT_STAGES_INFO[0];
  const activeSchoolConfig = SCHOOL_PERSPECTIVES[activeSchoolId] || SCHOOL_PERSPECTIVES['cbt'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // 按键监听：Escape 关闭抽屉与弹窗
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPromptDrawerOpen) setIsPromptDrawerOpen(false);
        if (isKBModalOpen) setIsKBModalOpen(false);
        if (showSchoolMenu) setShowSchoolMenu(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPromptDrawerOpen, isKBModalOpen, showSchoolMenu]);

  // 切换白噪音细雨声
  const toggleRainTherapy = () => {
    if (soundTherapy.isPlaying) {
      soundTherapy.stop();
      setIsRainActive(false);
    } else {
      soundTherapy.playRain();
      setIsRainActive(true);
    }
  };

  // 复制消息金句
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // 发送消息
  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend || inputVal).trim();
    if (!text || isGenerating) return;

    // 1. 安全守门人端侧前置检测
    const safetyCheck = checkCrisisIntent(text);
    if (safetyCheck.isCrisis) {
      onTriggerCrisis(safetyCheck.matchedPhrase);
      return;
    }

    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsgId = 'msg-' + Date.now();
    const now = Date.now();

    // 存储用户消息
    await db.messages.add({
      id: userMsgId,
      sessionId: currentSessionId,
      role: 'user',
      content: text,
      cbtStage: currentStage,
      createdAt: now,
    });

    // 自动更新会话标题
    if (messages.length <= 2 && (!session?.title || session?.title === '新的倾诉与疏导' || session?.title === '新的心绪倾诉')) {
      const summaryTitle = text.slice(0, 16) + (text.length > 16 ? '...' : '');
      await db.sessions.update(currentSessionId, { title: summaryTitle, updatedAt: now });
    } else {
      await db.sessions.update(currentSessionId, { updatedAt: now });
    }

    // 2. 流式生成
    setIsGenerating(true);
    setStreamingContent('');

    try {
      const historyPayload = [...messages, { role: 'user', content: text }].map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      const result = await streamAIChat({
        messages: historyPayload,
        cbtStage: currentStage,
        schoolId: activeSchoolId,
        onChunk: chunk => {
          setStreamingContent(prev => prev + chunk);
        },
      });

      // 保存完整的助手回复
      await db.messages.add({
        id: 'msg-assistant-' + Date.now(),
        sessionId: currentSessionId,
        role: 'assistant',
        content: result.fullContent,
        distortionTag: result.detectedDistortion,
        techniqueTag: result.techniqueTag,
        schoolTag: result.schoolTag,
        cbtStage: result.nextStage,
        createdAt: Date.now(),
      });

      // 更新会话的当前 CBT 阶段
      await db.sessions.update(currentSessionId, {
        cbtStage: result.nextStage,
        updatedAt: Date.now(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '与疏导助手连接出现异常，请稍后重试。';
      await db.messages.add({
        id: 'msg-err-' + Date.now(),
        sessionId: currentSessionId,
        role: 'assistant',
        content: `【温馨提示】${errorMessage}（你可以在右上角“港湾配置”中检查 API 设置，或清空 Key 使用内置离线纯净疏导模式）`,
        createdAt: Date.now(),
      });
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  // 快捷提取至三栏日记
  const extractToDiary = (assistantMsg: ChatMessage) => {
    const userPrev = messages.filter(m => m.role === 'user').pop();
    const eventText = userPrev ? userPrev.content.slice(0, 120) : '未记录情境';
    const thoughtText = userPrev ? userPrev.content : '消极思维';
    onExportToDiary(eventText, thoughtText, assistantMsg.content);
  };

  const drawerScenarios = drawerCategory === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === drawerCategory);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-radial-at-t from-[#FBFBFA] via-[#FAF9F6] to-[#F5F4F0]">
      {/* 柔光流韵背景氛围光晕 (Fluid Biophilic Ambient Orbs) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4D7A68]/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-[#C99A5B]/8 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-88 h-88 bg-[#E8D9C0]/15 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* 1. Cognitive Journey Stepper (心流渐进与治愈音画顶栏) */}
      <div className="shrink-0 px-4 sm:px-8 py-3.5 bg-white/60 backdrop-blur-2xl border-b border-[#224337]/6 z-10 shadow-[0_2px_12px_rgba(34,67,55,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* 阶段轨迹导航 */}
          <div className="flex-1 flex items-center justify-between relative py-1">
            {/* 背景贯穿流光轴线 */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-stone-200/80 rounded-full z-0 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#4D7A68] via-[#C99A5B] to-[#224337] transition-all duration-700 ease-out"
                style={{ width: `${((currentStage - 1) / 3) * 100}%` }}
              />
            </div>

            {/* 4 个认知里程碑点位 */}
            {CBT_STAGES_INFO.map(s => {
              const isPassed = s.stage < currentStage;
              const isCurrent = s.stage === currentStage;

              return (
                <div key={s.stage} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs transition-all duration-500 ${
                      isCurrent
                        ? 'bg-white text-[#224337] font-semibold shadow-[0_6px_20px_rgba(34,67,55,0.14)] border border-[#4D7A68]/40 ring-2 ring-[#4D7A68]/15 scale-105'
                        : isPassed
                        ? 'bg-[#EBF3EF] text-[#224337] border border-[#4D7A68]/25 shadow-2xs'
                        : 'bg-[#FAF9F6] text-stone-400 border border-stone-200/70 opacity-80'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7A68]" />
                    ) : (
                      <span className="text-xs">{s.icon}</span>
                    )}
                    <span className="tracking-tight text-[11.5px] sm:text-xs">
                      {s.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono tracking-tighter mt-1 hidden sm:block">
                    {s.en}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 顶栏右侧快捷工具胶囊群：流派视角 + 知识库锦囊 + 静谧雨声 + 阶段指引 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 咨询学派视角切换器 */}
            <div className="relative">
              <button
                onClick={() => setShowSchoolMenu(!showSchoolMenu)}
                className="flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-full border bg-white/90 hover:bg-white text-[#224337] border-[#4D7A68]/30 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer font-medium"
                title="切换当前咨询流派视角"
              >
                <span className="text-xs">{activeSchoolConfig.icon}</span>
                <span className="hidden sm:inline text-[11.5px] font-sans">{activeSchoolConfig.shortName}</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${showSchoolMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* 流派下拉选择菜单 */}
              {showSchoolMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-2xl shadow-[0_16px_40px_rgba(34,67,55,0.16)] p-2 z-50 animate-scale-up space-y-1">
                  <div className="px-2.5 py-1 text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider">
                    切换咨询学派视角
                  </div>
                  {Object.entries(SCHOOL_PERSPECTIVES).map(([key, item]) => {
                    const isSelected = activeSchoolId === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectSchool(key)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#EBF3EF] text-[#224337] font-semibold border border-[#4D7A68]/30'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="text-base mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span>{item.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#4D7A68]" />}
                          </div>
                          <div className="text-[10.5px] text-stone-400 font-normal line-clamp-1 mt-0.5">
                            {item.focus}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 知识库实操锦囊快速唤起按钮 */}
            <button
              onClick={() => {
                setIsKBModalOpen(true);
                setSelectedCase(null);
              }}
              className="flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1.5 rounded-full border bg-[#FCF7F0]/90 hover:bg-[#FAF3E8] text-[#73582A] border-[#C99A5B]/40 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer font-medium"
              title="在对话中直接查阅 9 大微技术、6 大临床案例与 10 大干预模板"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#C99A5B]" />
              <span className="text-[11.5px]">知识库锦囊</span>
            </button>

            {/* 白噪音治愈细雨开关 */}
            <button
              onClick={toggleRainTherapy}
              className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 ${
                isRainActive
                  ? 'bg-[#EBF3EF] text-[#224337] border-[#4D7A68]/40 shadow-[0_2px_10px_rgba(77,122,104,0.18)] font-medium animate-pulse'
                  : 'bg-white/80 hover:bg-white text-stone-600 border-stone-200/80 hover:border-stone-300'
              }`}
              title={isRainActive ? '关闭静谧细雨' : '开启轻柔细雨自然白噪音'}
            >
              {isRainActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#4D7A68]" />
                  <span className="text-[11.5px] hidden sm:inline">雨声流淌中</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[11.5px]">🌧️ 雨声</span>
                </>
              )}
            </button>

            {/* 阶段温馨贴士提示胶囊 */}
            <button
              onClick={() => setShowStageGuide(!showStageGuide)}
              className="hidden sm:flex items-center gap-1 text-[11.5px] text-[#4D7A68] hover:text-[#224337] bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-[#4D7A68]/20 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="查看当前阶段疏导指南"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>阶段指南</span>
            </button>
          </div>
        </div>

        {/* 展开的阶段温馨指南卡片 */}
        {showStageGuide && (
          <div className="max-w-4xl mx-auto mt-3 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#4D7A68]/20 shadow-[0_6px_20px_rgba(34,67,55,0.06)] flex items-start justify-between gap-3 animate-fade-in text-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">{activeStageInfo.icon}</span>
              <div>
                <div className="font-semibold text-[#224337] flex items-center gap-2">
                  <span>当前阶段 {activeStageInfo.stage} · {activeStageInfo.title}</span>
                  <span className="text-[10px] text-stone-400 font-mono tracking-wide uppercase">Stage {activeStageInfo.stage}</span>
                </div>
                <p className="text-stone-600 mt-1 leading-relaxed">
                  {activeStageInfo.guide}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStageGuide(false)}
              className="text-stone-400 hover:text-stone-700 px-2 py-0.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              收起
            </button>
          </div>
        )}
      </div>

      {/* 2. Empathetic Conversation Stream (共情对话流主区域) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-7">
          {/* 当完全没有任何消息时展现的超极简指引 */}
          {messages.length === 0 && (
            <div className="bg-white/85 backdrop-blur-2xl p-6 sm:p-9 rounded-[2rem] text-center space-y-4 shadow-[0_16px_48px_rgba(34,67,55,0.05)] border border-white/90 animate-fade-in">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#EBF3EF] to-[#F5F8F6] border border-[#4D7A68]/20 text-[#224337] mx-auto flex items-center justify-center shadow-[0_6px_20px_rgba(77,122,104,0.12)]">
                <Sparkles className="w-6 h-6 text-[#224337]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-serif font-medium text-[#224337] tracking-tight">
                  深吸一口气，把心绪安放在港湾
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                  这里没有评判，只有无条件的接纳、深沉的倾听与温和的理性能量。你可以倾吐任何细小的触动，或从以下精选场景开启：
                </p>
              </div>

              {/* 灵感卵石卡片 (Suggested Pebble Cards) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
                {SCENARIOS.slice(0, 4).map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => handleSend(sc.prompt)}
                    className="p-3.5 bg-white/90 hover:bg-white border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(77,122,104,0.09)] hover:-translate-y-0.5 text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{sc.icon}</span>
                        <span className="text-[10px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-md">
                          {sc.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        负荷 {sc.emotionalLoad}%
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-stone-800 group-hover:text-[#224337] transition-colors line-clamp-1">
                      {sc.title}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                      {sc.sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* 探索完整素材库与知识库入口 */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromptDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 hover:bg-white border border-[#C99A5B]/30 hover:border-[#C99A5B]/60 text-xs font-medium text-[#73582A] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C99A5B]" />
                  <span>心绪场景素材库 ({SCENARIOS.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKbTab('cases');
                    setIsKBModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#EBF3EF] hover:bg-[#E0ECE5] border border-[#4D7A68]/30 text-xs font-medium text-[#224337] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#4D7A68]" />
                  <span>临床逐字稿案例库 ({CLINICAL_CASES.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 临床心理学真实逐字稿案例速选区 */}
              <div className="pt-3 border-t border-stone-200/60 text-left max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-semibold text-[#224337] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#4D7A68]" />
                    <span>临床名家逐字稿演练（点击首句即刻代入对话）：</span>
                  </span>
                  <button
                    onClick={() => {
                      setKbTab('cases');
                      setIsKBModalOpen(true);
                    }}
                    className="text-[11px] text-[#4D7A68] hover:text-[#224337] flex items-center gap-0.5 cursor-pointer font-medium"
                  >
                    <span>全案微观解析</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CLINICAL_CASES.slice(0, 4).map(c => {
                    const firstLine = c.dialogue[0]?.text || '';
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSend(firstLine)}
                        className="p-3 bg-white/90 hover:bg-white border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl transition-all duration-300 shadow-2xs hover:shadow-xs text-left cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-md">
                            {c.tag}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            真实个案
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-800 group-hover:text-[#224337] transition-colors line-clamp-1">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1 line-clamp-2 italic leading-relaxed">
                          “{firstLine}”
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 历史消息流 */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isFirstAssistantGreeting = !isUser && index === 0 && messages.filter(m => m.role === 'user').length === 0;
            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end animate-fade-in">
                  <div className="max-w-[85%] sm:max-w-[78%] bg-gradient-to-br from-[#224337] via-[#1b382e] to-[#142b23] text-[#FAF9F6] rounded-[24px_24px_6px_24px] px-5 py-4 text-[15px] leading-[1.8] tracking-[0.015em] shadow-[0_8px_28px_rgba(34,67,55,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] selection:bg-[#4D7A68]/50 selection:text-white">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex gap-3.5 items-start animate-fade-in group">
                {/* 助手羊脂玉头像 */}
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-white to-[#F5F8F6] border border-white/90 text-[#224337] flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(34,67,55,0.08)] mt-0.5 ring-2 ring-[#4D7A68]/10">
                  <Sparkles className="w-4 h-4 text-[#4D7A68]" />
                </div>

                {/* 助手羊脂白玉容器 */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="bg-white/92 backdrop-blur-xl border border-white/95 rounded-[24px_24px_24px_6px] p-5 sm:p-6 text-[15.5px] leading-[1.85] text-stone-800 shadow-[0_10px_36px_rgba(34,67,55,0.06)] tracking-[0.015em] selection:bg-[#4D7A68]/20">
                    {/* 晨露琥珀色认知偏差胶囊 + 临床微技术标签 + 学派标签 */}
                    <div className="flex flex-wrap items-center gap-2 mb-3.5">
                      {msg.distortionTag && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAF4EB] text-[#7A5B28] border border-[#E2CEB1] shadow-[0_2px_10px_rgba(201,154,91,0.12)]">
                          <Lightbulb className="w-3.5 h-3.5 text-[#C99A5B]" />
                          <span>觉察思维滤镜：</span>
                          <span className="font-semibold text-[#66491D]">{msg.distortionTag}</span>
                        </div>
                      )}

                      {msg.techniqueTag && (
                        <button
                          type="button"
                          onClick={() => {
                            setKbTab('techniques');
                            setIsKBModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EBF3EF] text-[#224337] border border-[#4D7A68]/30 shadow-[0_2px_10px_rgba(77,122,104,0.1)] hover:bg-[#E0ECE5] cursor-pointer transition-colors"
                          title="点击查看此微技术临床原理与实操范式"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#4D7A68]" />
                          <span>运用微技术：</span>
                          <span className="font-semibold text-[#183429]">{msg.techniqueTag}</span>
                        </button>
                      )}

                      {msg.schoolTag && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-stone-100 text-stone-600 border border-stone-200/70">
                          {msg.schoolTag}
                        </span>
                      )}
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-stone-800/95">
                      {msg.content}
                    </div>
                  </div>

                  {/* 微交互工具栏：提炼至手账 + 复制金句 */}
                  <div className="flex items-center gap-2 pl-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => extractToDiary(msg)}
                      className="text-xs text-stone-500 hover:text-[#224337] flex items-center gap-1.5 px-3 py-1 rounded-xl hover:bg-white/90 border border-transparent hover:border-stone-200/60 transition-all cursor-pointer shadow-2xs"
                      title="将此启发沉淀至三栏重塑手账"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#4D7A68]" />
                      <span>提炼至手账</span>
                    </button>

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-white/80 transition-all cursor-pointer"
                      title="复制回复文本"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px]">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-[11px]">复制</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 首次会话欢迎时，以快捷建议气泡形式融入对话流 */}
                  {isFirstAssistantGreeting && (
                    <div className="pt-3 space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between pl-1">
                        <span className="text-[11.5px] text-stone-500 font-medium">
                          点击下方贴近的情绪困扰，一键开启探讨：
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsPromptDrawerOpen(true)}
                          className="text-[11px] text-[#4D7A68] hover:text-[#224337] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[#4D7A68]" />
                          <span>展开全部素材库 ({SCENARIOS.length})</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {SCENARIOS.slice(0, 4).map(sc => (
                          <button
                            key={sc.id}
                            onClick={() => handleSend(sc.prompt)}
                            className="p-3 bg-white/90 hover:bg-white border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(77,122,104,0.08)] hover:-translate-y-0.5 text-left cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{sc.icon}</span>
                                <span className="text-[10px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-md">
                                  {sc.tag}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono">
                                负荷 {sc.emotionalLoad}%
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-stone-800 group-hover:text-[#224337] transition-colors leading-snug line-clamp-1">
                              {sc.title}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 实时打字机流式气泡 */}
          {isGenerating && streamingContent && (
            <div className="flex gap-3.5 items-start animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md border border-white/90 text-[#224337] flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(34,67,55,0.08)] mt-0.5">
                <Sparkles className="w-4 h-4 text-[#4D7A68] animate-spin" />
              </div>
              <div className="flex-1 bg-white/92 backdrop-blur-xl border border-white/95 rounded-[24px_24px_24px_6px] p-5 sm:p-6 text-[15.5px] leading-[1.85] text-stone-800 shadow-[0_10px_36px_rgba(34,67,55,0.06)] tracking-[0.015em]">
                <div className="whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 ml-1 bg-[#4D7A68] animate-pulse align-middle rounded-sm" />
                </div>
              </div>
            </div>
          )}

          {/* 生成等待骨架 */}
          {isGenerating && !streamingContent && (
            <div className="flex items-center gap-2.5 text-stone-400 text-xs pl-12 animate-fade-in">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4D7A68]" />
              <span>疏导导师正在静心体察并梳理思绪...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Zen Floating Bar & Input Dock (悬浮指令岛) */}
      <div className="p-4 sm:p-6 shrink-0 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* Zen 呼吸安抚胶囊与素材库按键群 */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2.5">
            <button
              type="button"
              onClick={onOpenBreathing}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-[#4D7A68]/20 shadow-[0_4px_16px_rgba(77,122,104,0.08)] hover:shadow-[0_6px_20px_rgba(77,122,104,0.15)] text-xs text-[#224337] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5 text-[#4D7A68] animate-pulse" />
              <span className="text-[11.5px] font-medium">
                4-7-8 呼吸静心
              </span>
            </button>

            <button
              type="button"
              onClick={toggleRainTherapy}
              className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md border transition-all hover:scale-[1.02] cursor-pointer ${
                isRainActive
                  ? 'bg-[#EBF3EF] text-[#224337] border-[#4D7A68]/40 shadow-[0_4px_16px_rgba(77,122,104,0.15)] font-medium'
                  : 'bg-white/90 hover:bg-white text-stone-600 border-stone-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
              }`}
            >
              {isRainActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#4D7A68]" />
                  <span className="text-[11.5px]">细雨流淌中</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[11.5px]">🌧️ 静谧雨声</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsPromptDrawerOpen(true)}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FCF7F0]/95 hover:bg-[#FAF3E8] backdrop-blur-md border border-[#C99A5B]/30 shadow-[0_4px_16px_rgba(201,154,91,0.08)] hover:shadow-[0_6px_20px_rgba(201,154,91,0.15)] text-xs text-[#73582A] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C99A5B]" />
              <span className="text-[11.5px] font-medium">
                💡 心绪场景灵感库
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsKBModalOpen(true);
                setSelectedCase(null);
              }}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF3EF]/95 hover:bg-[#E0ECE5] backdrop-blur-md border border-[#4D7A68]/30 shadow-[0_4px_16px_rgba(77,122,104,0.08)] hover:shadow-[0_6px_20px_rgba(77,122,104,0.15)] text-xs text-[#224337] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#4D7A68]" />
              <span className="text-[11.5px] font-medium">
                📚 咨询师知识库
              </span>
            </button>
          </div>

          {/* 悬浮指令岛核心输入框 */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_16px_48px_rgba(34,67,55,0.08)] p-3 sm:p-3.5 transition-all duration-300 focus-within:shadow-[0_20px_54px_rgba(77,122,104,0.16)] focus-within:border-[#4D7A68]/40 focus-within:ring-4 focus-within:ring-[#4D7A68]/10 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputVal}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="说出此刻的心情或困扰... 每一声叹息都会被温柔听见（Enter 发送，Shift+Enter 换行）"
              className="w-full bg-transparent border-0 resize-none px-3 py-1.5 text-[14.5px] text-stone-800 placeholder-stone-400 focus:outline-hidden leading-relaxed max-h-36"
            />
            <div className="flex items-center justify-between pt-2 border-t border-stone-100/80 px-1">
              <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4D7A68]" />
                <span>端侧私密加密</span>
                <span className="text-stone-300">·</span>
                <span className="hidden sm:inline">无云端数据追踪</span>
              </div>

              <button
                onClick={() => handleSend()}
                disabled={isGenerating || !inputVal.trim()}
                className="w-9 h-9 rounded-2xl bg-[#224337] hover:bg-[#1a352b] disabled:opacity-20 text-white flex items-center justify-center transition-all duration-200 shadow-[0_4px_14px_rgba(34,67,55,0.25)] active:scale-95 disabled:shadow-none cursor-pointer"
                title="发送"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-stone-400 text-center mt-2.5 font-mono tracking-wider opacity-75">
            LOCAL-FIRST ENCRYPTED · SAFE HARBOR · CRISIS LINE: 400-161-9995
          </div>
        </div>
      </div>

      {/* 4. 心绪素材灵感库弹窗抽屉 (Prompt Sanctuary Drawer Modal) */}
      {isPromptDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsPromptDrawerOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] bg-[#FAF9F6] border border-white/90 rounded-3xl shadow-[0_24px_64px_rgba(34,67,55,0.25)] flex flex-col overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer 顶栏 */}
            <div className="px-6 py-4.5 border-b border-stone-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-[#4D7A68]" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#224337]">
                    心绪素材与场景灵感库
                  </h3>
                  <p className="text-xs text-stone-500">
                    针对高频思维偏差量身定制的 CBT 提示词，一键带入对话
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPromptDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 分类筛选器 */}
            <div className="px-6 py-3 border-b border-stone-200/50 bg-white/50 flex items-center gap-2 overflow-x-auto shrink-0">
              {CATEGORIES.map(cat => {
                const isSel = drawerCategory === cat.key;
                const count = cat.key === 'all'
                  ? SCENARIOS.length
                  : SCENARIOS.filter(s => s.category === cat.key).length;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setDrawerCategory(cat.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-[#224337] text-white shadow-xs'
                        : 'bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSel ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 场景列表可滚区域 */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {drawerScenarios.map(sc => {
                const loadColor =
                  sc.emotionalLoad >= 88
                    ? 'bg-rose-500'
                    : sc.emotionalLoad >= 80
                    ? 'bg-amber-500'
                    : 'bg-[#4D7A68]';

                return (
                  <div
                    key={sc.id}
                    className="bg-white/90 border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl p-4.5 space-y-3 shadow-2xs hover:shadow-sm transition-all text-left"
                  >
                    {/* 卡片顶栏 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sc.icon}</span>
                        <span className="text-[11px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                          {sc.tag}
                        </span>
                        <span className="text-xs font-semibold text-stone-800">
                          {sc.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded-full text-[10.5px]">
                        <span className="text-stone-400 font-mono">负荷</span>
                        <span className="font-semibold text-stone-700">{sc.emotionalLoad}%</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${loadColor}`} />
                      </div>
                    </div>

                    {/* 思维偏差标签 */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] bg-[#FCF7F0] text-[#73582A] border border-[#E8D9C0]/70 font-medium">
                      <Lightbulb className="w-3 h-3 text-[#C99A5B]" />
                      <span>常见思维偏差：{sc.distortion}</span>
                    </div>

                    {/* 提示词引文 */}
                    <div className="p-3 bg-stone-50/90 rounded-xl border border-stone-100 text-xs text-stone-600 leading-relaxed italic">
                      “{sc.prompt}”
                    </div>

                    {/* 底部操作条 */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-400">
                        💡 {sc.hint}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInputVal(sc.prompt);
                            setIsPromptDrawerOpen(false);
                            textareaRef.current?.focus();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          填入微调
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPromptDrawerOpen(false);
                            handleSend(sc.prompt);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>直接倾诉</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* 5. 网页对话内嵌心理咨询技术与临床案例知识库弹窗 (In-Chat Knowledge Base Sanctuary Modal) */}
      {isKBModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsKBModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#FAF9F6] border border-white/90 rounded-3xl shadow-[0_24px_64px_rgba(34,67,55,0.25)] flex flex-col overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal 顶栏 */}
            <div className="px-6 py-4.5 border-b border-stone-200/70 bg-white/85 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center shadow-2xs">
                  <GraduationCap className="w-5 h-5 text-[#4D7A68]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-semibold text-[#224337]">
                      心理咨询专业知识库 · 对话锦囊
                    </h3>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#224337] border border-[#4D7A68]/30 font-medium">
                      当前流派：{activeSchoolConfig.name}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    融合五大学派理论、9 项核心微技术与 6 大真实临床逐字稿，可直接一键代入网页对话
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsKBModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 知识库主分类 Tab 导航 */}
            <div className="px-6 py-2.5 border-b border-stone-200/60 bg-white/60 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => { setKbTab('techniques'); setSelectedCase(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  kbTab === 'techniques'
                    ? 'bg-[#224337] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>💡 微技术锦囊 (9项)</span>
              </button>

              <button
                type="button"
                onClick={() => { setKbTab('cases'); setSelectedCase(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  kbTab === 'cases'
                    ? 'bg-[#224337] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/70'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>🎭 临床逐字稿案例 ({CLINICAL_CASES.length}组)</span>
              </button>

              <button
                type="button"
                onClick={() => { setKbTab('templates'); setSelectedCase(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  kbTab === 'templates'
                    ? 'bg-[#224337] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/70'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📋 经典干预模板 ({TECHNIQUE_TEMPLATES.length}张)</span>
              </button>

              <button
                type="button"
                onClick={() => { setKbTab('schools'); setSelectedCase(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  kbTab === 'schools'
                    ? 'bg-[#224337] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🏛️ 五大流派矩阵</span>
              </button>

              <button
                type="button"
                onClick={() => { setKbTab('crisis'); setSelectedCase(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  kbTab === 'crisis'
                    ? 'bg-[#9C3D26] text-white shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200/70'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🛡️ 危机干预 SOP</span>
              </button>
            </div>

            {/* Modal 内容区 */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* 1. 微技术锦囊 */}
              {kbTab === 'techniques' && (
                <div className="space-y-6 animate-fade-in">
                  {MICRO_TECHNIQUES.map((cat, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-stone-200/60 pb-2">
                        <span className="w-2 h-2 rounded-full bg-[#4D7A68]" />
                        <h4 className="text-sm font-semibold text-[#224337]">
                          {cat.category}
                        </h4>
                        <span className="text-xs text-stone-400">({cat.enCategory})</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {cat.items.map((item, i) => (
                          <div
                            key={i}
                            className="bg-white/90 border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl p-4 space-y-2.5 shadow-2xs hover:shadow-xs transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-stone-800">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {item.enName}
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed">
                              {item.desc}
                            </p>

                            <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-stone-200/60 text-[11.5px] text-[#224337] italic leading-relaxed">
                              “{item.example}”
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setInputVal(item.example);
                                  setIsKBModalOpen(false);
                                  textareaRef.current?.focus();
                                }}
                                className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                              >
                                填入输入框
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsKBModalOpen(false);
                                  handleSend(`请心理导师运用【${item.name}】微技术，帮我分析梳理当下的困扰与情绪。`);
                                }}
                                className="px-3 py-1 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <span>向导师探讨此技术</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. 临床逐字稿案例 */}
              {kbTab === 'cases' && (
                <div className="animate-fade-in">
                  {!selectedCase ? (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-[#EBF3EF]/70 border border-[#4D7A68]/30 rounded-2xl text-xs text-[#224337] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#4D7A68]" />
                          <span>点击“查看微观逐字稿”研读真实督导复盘，或点击“代入首句演练”开启实战模拟对话</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CLINICAL_CASES.map(c => (
                          <div
                            key={c.id}
                            className="bg-white/95 border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl p-4.5 space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                                  {c.tag}
                                </span>
                                <span className="text-[10.5px] text-stone-400">
                                  {c.subTag}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-stone-800">
                                {c.title}
                              </h4>

                              <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                                <span className="font-semibold text-stone-700">来访背景：</span>
                                {c.clientBackground}
                              </p>

                              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-600 leading-relaxed italic line-clamp-2">
                                “{c.dialogue[0]?.text}”
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                              <button
                                type="button"
                                onClick={() => setSelectedCase(c)}
                                className="text-xs font-semibold text-[#4D7A68] hover:text-[#224337] cursor-pointer flex items-center gap-1"
                              >
                                <span>查看微观逐字稿</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsKBModalOpen(false);
                                  handleSend(c.dialogue[0]?.text);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium shadow-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>代入首句演练</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 单案逐字稿详情页 */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedCase(null)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          ← 返回案例列表
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsKBModalOpen(false);
                            handleSend(selectedCase.dialogue[0]?.text);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#224337] hover:bg-[#1a352b] px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <span>一键代入此案例首句与导师探讨</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-stone-200/80 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#224337] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                            {selectedCase.tag}
                          </span>
                          <h4 className="text-base font-serif font-bold text-stone-900">
                            {selectedCase.title}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-600">
                          <span className="font-semibold text-stone-800">来访背景：</span>
                          {selectedCase.clientBackground}
                        </p>
                        <div className="p-3 bg-[#FAF4EB] text-[#7A5B28] rounded-xl border border-[#E2CEB1] text-xs leading-relaxed">
                          <span className="font-semibold">💡 督导临床解析：</span>
                          {selectedCase.therapeuticInsight}
                        </div>
                      </div>

                      {/* 逐字稿对话气泡流 */}
                      <div className="space-y-3.5 bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200/60">
                        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                          咨询室现场逐字还原 (Verbatim Transcripts)
                        </div>

                        {selectedCase.dialogue.map((item, dIdx) => (
                          <div
                            key={dIdx}
                            className={`flex gap-3 items-start ${
                              item.speaker === 'client' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {item.speaker === 'counselor' && (
                              <div className="w-7 h-7 rounded-xl bg-[#EBF3EF] text-[#224337] flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-3.5 h-3.5 text-[#4D7A68]" />
                              </div>
                            )}

                            <div
                              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                                item.speaker === 'client'
                                  ? 'bg-[#224337] text-white rounded-tr-none'
                                  : 'bg-white border border-stone-200 text-stone-800 shadow-2xs rounded-tl-none space-y-1.5'
                              }`}
                            >
                              {item.speaker === 'counselor' && item.technique && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EF] text-[#224337] text-[10.5px] font-semibold">
                                  <Sparkles className="w-3 h-3 text-[#4D7A68]" />
                                  <span>技术：{item.technique}</span>
                                </div>
                              )}
                              <p className="whitespace-pre-wrap">{item.text}</p>
                            </div>

                            {item.speaker === 'client' && (
                              <div className="w-7 h-7 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 mt-1">
                                <User className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. 经典干预模板 */}
              {kbTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {TECHNIQUE_TEMPLATES.map((tpl, tIdx) => (
                    <div
                      key={tIdx}
                      className="bg-white/95 border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl p-4.5 space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-semibold text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                            {tpl.phase}
                          </span>
                          <span className="text-xs font-bold text-stone-800">
                            {tpl.technique}
                          </span>
                        </div>

                        <div className="p-3 bg-[#FAF9F6] rounded-xl border border-stone-200/60 text-xs text-stone-800 leading-relaxed font-sans italic">
                          “{tpl.template}”
                        </div>

                        <p className="text-[11.5px] text-stone-500 leading-relaxed">
                          <span className="font-semibold text-stone-700">机制原理：</span>
                          {tpl.rationale}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setInputVal(tpl.template);
                            setIsKBModalOpen(false);
                            textareaRef.current?.focus();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          填入微调
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsKBModalOpen(false);
                            handleSend(tpl.template);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>直接带入对话</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. 五大学派矩阵 */}
              {kbTab === 'schools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {THEORY_SCHOOLS.map(sc => {
                    const isCurrent = activeSchoolId === sc.id;
                    return (
                      <div
                        key={sc.id}
                        className={`bg-white/95 border rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'border-[#4D7A68] ring-2 ring-[#4D7A68]/20 shadow-xs'
                            : 'border-stone-200/70 hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-stone-900">
                              {sc.name}
                            </h4>
                            <span className="text-[10.5px] text-stone-400 font-mono">
                              {sc.representative.split(',')[0]}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-400 font-mono">
                            {sc.en}
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <p className="text-stone-700">
                              <span className="font-semibold text-stone-900">核心假设：</span>
                              {sc.coreAssumption}
                            </p>
                            <p className="text-stone-600">
                              <span className="font-semibold text-stone-800">干预机制：</span>
                              {sc.mechanism}
                            </p>
                            <p className="text-stone-500">
                              <span className="font-semibold text-stone-700">适用困扰：</span>
                              {sc.scenarios}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4D7A68]">
                              <Check className="w-3.5 h-3.5" />
                              <span>当前对话已启用此流派视角</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSchool(sc.id);
                                setIsKBModalOpen(false);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <span>切换为此流派视角</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. 危机干预与伦理准则 */}
              {kbTab === 'crisis' && (
                <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
                  <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>国家标准生命危机干预与保密例外原则 (Confidentiality Exceptions)</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      当来访者出现明确的自杀自伤意图、伤害他人意图、或虐待儿童老人事实时，根据心理咨询伦理与法律规范，保密原则无条件解除。系统将触发危机安抚协议并直接转接紧急热线。
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      C-SSRS 哥伦比亚自杀严重程度评估 4 步阶梯递进技术
                    </h4>
                    <div className="space-y-2.5">
                      {CRISIS_SOP.cssrsSteps.map((q, idx) => (
                        <div key={idx} className="p-3 bg-[#FAF9F6] rounded-xl border border-stone-200/60 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-rose-900">{q.step}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{q.aim}</span>
                          </div>
                          <p className="text-stone-700 italic">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-stone-800">24小时全国免费心理危机热线</div>
                      <div className="text-base font-mono font-bold text-[#224337] mt-0.5">400-161-9995</div>
                    </div>
                    <a
                      href="tel:4001619995"
                      className="px-4 py-2 rounded-xl bg-[#224337] text-white text-xs font-medium hover:bg-[#1a352b] transition-colors"
                    >
                      拨打热线
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
