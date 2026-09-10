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
  ArrowRight
} from 'lucide-react';
import { db, type ChatMessage } from '../db';
import { streamAIChat } from '../services/ai';
import { checkCrisisIntent } from '../utils/safety';
import { SCENARIOS, CATEGORIES, type CategoryKey } from '../data/scenarios';

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
    guide: '写下让你感到紧绷或难过的事实，无需自责，这里是绝对安全的空间。'
  },
  {
    stage: 2,
    title: '捕获思维',
    en: 'Identify',
    icon: '🔍',
    desc: '捕捉脑海深处悄然涌现的消极自动化念头',
    guide: '注意脑海中的“第一反应”：是不是出现了绝对化、灾难化的念头？'
  },
  {
    stage: 3,
    title: '理性检验',
    en: 'Examine',
    icon: '💡',
    desc: '寻找客观中立的证据，辨别认知滤镜偏差',
    guide: '问问自己：这个最坏的想法有 100% 的事实支撑吗？是否存在其他可能性？'
  },
  {
    stage: 4,
    title: '重塑信念',
    en: 'Reframe',
    icon: '☀️',
    desc: '构建兼顾理性与温度的替代平衡思维',
    guide: '如果好友遇到同样处境，你会如何温和而客观地鼓励他？'
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

  const currentStage = session?.cbtStage || 1;
  const activeStageInfo = CBT_STAGES_INFO.find(s => s.stage === currentStage) || CBT_STAGES_INFO[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // 按键监听：Escape 关闭抽屉
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPromptDrawerOpen) {
        setIsPromptDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPromptDrawerOpen]);

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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* 1. Cognitive Journey Stepper (心流渐进轨迹顶栏) */}
      <div className="shrink-0 px-4 sm:px-8 py-3 bg-white/45 backdrop-blur-xl border-b border-[#224337]/5 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* 阶段轨迹导航 */}
          <div className="flex-1 flex items-center justify-between relative py-1">
            {/* 背景贯穿流光轴线 */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-stone-200/70 rounded-full z-0 overflow-hidden">
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
                <div key={s.stage} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs transition-all duration-500 ${
                      isCurrent
                        ? 'bg-white text-[#224337] font-semibold shadow-[0_4px_16px_rgba(34,67,55,0.12)] border border-[#4D7A68]/30 scale-105'
                        : isPassed
                        ? 'bg-[#EBF3EF] text-[#224337] border border-[#4D7A68]/20 shadow-xs'
                        : 'bg-[#FAF9F6] text-stone-400 border border-stone-200/60'
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

          {/* 阶段温馨贴士提示胶囊 */}
          <button
            onClick={() => setShowStageGuide(!showStageGuide)}
            className="hidden sm:flex items-center gap-1 text-[11px] text-[#4D7A68] hover:text-[#224337] bg-white/70 hover:bg-white px-2.5 py-1 rounded-full border border-[#4D7A68]/20 transition-all cursor-pointer shadow-xs shrink-0"
            title="查看当前阶段疏导指南"
          >
            <HelpCircle className="w-3 h-3" />
            <span>阶段指引</span>
          </button>
        </div>

        {/* 展开的阶段温馨指南卡片 */}
        {showStageGuide && (
          <div className="max-w-4xl mx-auto mt-2.5 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-[#4D7A68]/20 shadow-[0_4px_16px_rgba(34,67,55,0.06)] flex items-start justify-between gap-3 animate-fade-in text-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">{activeStageInfo.icon}</span>
              <div>
                <span className="font-semibold text-[#224337]">
                  当前处于：阶段 {activeStageInfo.stage} · {activeStageInfo.title}
                </span>
                <p className="text-stone-600 mt-0.5 leading-relaxed">
                  {activeStageInfo.guide}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStageGuide(false)}
              className="text-stone-400 hover:text-stone-700 px-2 py-0.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
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
            <div className="glass-sanctuary p-6 sm:p-9 rounded-[2rem] text-center space-y-4 shadow-[0_12px_40px_rgba(34,67,55,0.04)] border border-white/80 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EBF3EF] to-[#F5F8F6] border border-[#4D7A68]/20 text-[#224337] mx-auto flex items-center justify-center shadow-[0_4px_16px_rgba(77,122,104,0.1)]">
                <Sparkles className="w-6 h-6 text-[#224337]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-serif font-medium text-[#224337] tracking-tight">
                  深呼吸，把心事放进避风港
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                  这里没有评判，只有无条件的接纳、沉静的聆听与温和的理性能量。你可以倾吐任何细小的触动，或从以下精选场景开启：
                </p>
              </div>

              {/* 灵感卵石卡片 (Suggested Pebble Cards) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
                {SCENARIOS.slice(0, 4).map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => handleSend(sc.prompt)}
                    className="p-3.5 bg-white/85 hover:bg-white border border-stone-200/70 hover:border-[#4D7A68]/40 rounded-2xl transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(77,122,104,0.08)] hover:-translate-y-0.5 text-left cursor-pointer group"
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

              {/* 探索完整素材库入口 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromptDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 hover:bg-white border border-[#C99A5B]/30 hover:border-[#C99A5B]/60 text-xs font-medium text-[#73582A] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C99A5B]" />
                  <span>探索更多心绪素材与提示词（共 {SCENARIOS.length} 组场景）</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
                  <div className="max-w-[85%] sm:max-w-[78%] bg-gradient-to-br from-[#224337] to-[#1a352b] text-[#FAF9F6] rounded-[22px_22px_6px_22px] px-5 py-3.5 text-[15px] leading-[1.8] tracking-[0.015em] shadow-[0_6px_24px_rgba(34,67,55,0.18)] selection:bg-[#4D7A68]/50 selection:text-white">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex gap-3.5 items-start animate-fade-in group">
                {/* 助手羊脂玉头像 */}
                <div className="w-9 h-9 rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 text-[#224337] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(34,67,55,0.06)] mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#4D7A68]" />
                </div>

                {/* 助手羊脂白玉容器 */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-[22px_22px_22px_6px] p-5 sm:p-6 text-[15.5px] leading-[1.8] text-stone-800 shadow-[0_8px_32px_rgba(34,67,55,0.05)] tracking-[0.015em] selection:bg-[#4D7A68]/20">
                    {/* 晨露琥珀色认知偏差胶囊 */}
                    {msg.distortionTag && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FCF7F0] text-[#8C6D3F] border border-[#E8D9C0] shadow-[0_2px_8px_rgba(201,154,91,0.1)] mb-3">
                        <span>💡 识别思维滤镜：</span>
                        <span className="font-semibold text-[#73582A]">{msg.distortionTag}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>

                  {/* 微交互工具栏 */}
                  <div className="flex items-center gap-2 pl-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => extractToDiary(msg)}
                      className="text-xs text-stone-400 hover:text-[#224337] flex items-center gap-1.5 px-3 py-1 rounded-xl hover:bg-white/80 border border-transparent hover:border-stone-200/50 transition-all cursor-pointer shadow-2xs"
                      title="将此启发沉淀至三栏重塑手账"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#4D7A68]" />
                      <span>提炼至手账</span>
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
              <div className="w-9 h-9 rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 text-[#224337] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(34,67,55,0.06)] mt-0.5">
                <Sparkles className="w-4 h-4 text-[#4D7A68] animate-spin" />
              </div>
              <div className="flex-1 bg-white/85 backdrop-blur-xl border border-white/90 rounded-[22px_22px_22px_6px] p-5 sm:p-6 text-[15.5px] leading-[1.8] text-stone-800 shadow-[0_8px_32px_rgba(34,67,55,0.05)] tracking-[0.015em]">
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
              <span>疏导助手正在静心体察并梳理思绪...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Zen Breathing & Prompt Sanctuary Floating Bar & Input Dock (悬浮指令岛) */}
      <div className="p-4 sm:p-6 shrink-0 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* Zen 呼吸安抚胶囊与素材库按键群 */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2.5">
            <button
              type="button"
              onClick={onOpenBreathing}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-md border border-[#4D7A68]/20 shadow-[0_4px_16px_rgba(77,122,104,0.08)] hover:shadow-[0_6px_20px_rgba(77,122,104,0.15)] text-xs text-[#224337] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5 text-[#4D7A68] animate-pulse" />
              <span className="text-[11.5px] font-medium">
                4-7-8 呼吸静心
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsPromptDrawerOpen(true)}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FCF7F0]/95 hover:bg-[#FAF3E8] backdrop-blur-md border border-[#C99A5B]/30 shadow-[0_4px_16px_rgba(201,154,91,0.08)] hover:shadow-[0_6px_20px_rgba(201,154,91,0.15)] text-xs text-[#73582A] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C99A5B]" />
              <span className="text-[11.5px] font-medium">
                💡 心绪素材与场景灵感库
              </span>
            </button>
          </div>

          {/* 悬浮指令岛核心输入框 */}
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_12px_44px_rgba(34,67,55,0.08)] p-3 sm:p-3.5 transition-all duration-300 focus-within:shadow-[0_16px_48px_rgba(77,122,104,0.15)] focus-within:border-[#4D7A68]/40 focus-within:ring-4 focus-within:ring-[#4D7A68]/10 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputVal}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="说出此刻的心情或困扰...（Enter 发送，Shift+Enter 换行）"
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
    </div>
  );
};
