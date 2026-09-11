import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Sparkles,
  Trash2,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Feather,
  Calendar,
  Layers,
  Heart,
} from 'lucide-react';
import { db } from '../db';
import { generateRationalThoughts } from '../services/ai';
import { checkCrisisIntent } from '../utils/safety';

interface CBTDiaryProps {
  initialEvent?: string;
  initialThought?: string;
  initialRational?: string;
  onTriggerCrisis: (phrase?: string) => void;
}

const COMMON_DISTORTIONS = [
  '灾难化预设',
  '非黑即白',
  '过度概括',
  '读心术（自认被否定）',
  '应该句式（苛求自己）',
  '情绪化推理',
  '个人化归因',
  '心理过滤（只看坏处）',
];

export const CBTDiaryComponent: React.FC<CBTDiaryProps> = ({
  initialEvent = '',
  initialThought = '',
  initialRational = '',
  onTriggerCrisis,
}) => {
  const diaries = useLiveQuery(() => db.diaries.orderBy('createdAt').reverse().toArray(), []) || [];

  const [eventTrigger, setEventTrigger] = useState(initialEvent);
  const [negativeThought, setNegativeThought] = useState(initialThought);
  const [distortionTag, setDistortionTag] = useState('灾难化预设');
  const [rationalThought, setRationalThought] = useState(initialRational);
  const [scoreBefore, setScoreBefore] = useState(75);
  const [scoreAfter, setScoreAfter] = useState(30);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 点击“AI 启发理性视角”
  const handleGenerateAI = async () => {
    if (!eventTrigger.trim() || !negativeThought.trim()) {
      alert('请先写下事实情境与脑海中的消极念头，导师将针对具体情境为你提炼理性替代视角。');
      return;
    }

    // 危机前置检测
    const safetyCheck = checkCrisisIntent(negativeThought);
    if (safetyCheck.isCrisis) {
      onTriggerCrisis(safetyCheck.matchedPhrase);
      return;
    }

    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
      const suggestions = await generateRationalThoughts(eventTrigger, negativeThought);
      setAiSuggestions(suggestions);
    } catch {
      alert('生成建议失败，请稍后重试');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 保存日记记录
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTrigger.trim() || !negativeThought.trim() || !rationalThought.trim()) {
      alert('请完整填写三栏内容，完成一次完整的认知重塑闭环。');
      return;
    }

    const safetyCheck = checkCrisisIntent(negativeThought + ' ' + rationalThought);
    if (safetyCheck.isCrisis) {
      onTriggerCrisis(safetyCheck.matchedPhrase);
      return;
    }

    await db.diaries.add({
      id: 'diary-' + Date.now(),
      eventTrigger: eventTrigger.trim(),
      negativeThought: negativeThought.trim(),
      distortionTag,
      rationalThought: rationalThought.trim(),
      emotionScoreBefore: Number(scoreBefore),
      emotionScoreAfter: Number(scoreAfter),
      createdAt: Date.now(),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2800);

    // 清空表单
    setEventTrigger('');
    setNegativeThought('');
    setRationalThought('');
    setAiSuggestions([]);
    setScoreBefore(75);
    setScoreAfter(30);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定从手账长卷中移除这条重塑记录吗？')) {
      await db.diaries.delete(id);
    }
  };

  const handleCopyRational = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reliefDelta = Math.max(0, scoreBefore - scoreAfter);
  const reliefPercentage = scoreBefore > 0 ? Math.round((reliefDelta / scoreBefore) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 relative bg-radial-at-t from-[#FBFBFA] via-[#FAF9F6] to-[#F5F4F0]">
      {/* 柔光流韵背景氛围光晕 (Fluid Biophilic Ambient Orbs) */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#4D7A68]/8 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '9s' }} />
      <div className="absolute top-1/2 left-4 w-80 h-80 bg-[#C99A5B]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative z-10">
        {/* 顶部哲思与手账引言区 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#4D7A68] tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#4D7A68] animate-ping" />
            <span>CBT Reframing Journal · 认知重构手账</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#224337] tracking-tight">
              解构思维滤镜 · 重筑心灵从容
            </h2>
            <span className="text-xs text-stone-400 font-mono">
              三栏辩证疗法 · 本地离线安全私密
            </span>
          </div>

          {/* 斯多葛与贝克箴言书签 */}
          <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-stone-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-3 text-xs text-stone-600 leading-relaxed">
            <Feather className="w-4 h-4 text-[#C99A5B] shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-[#224337]">「真正困扰人的，并非客观事物本身，而是我们加诸其上的执念与判词。」</span>
              <span className="text-stone-400 ml-2">—— 爱比克泰德（斯多葛学派）· 贝克认知疗法核心基石</span>
            </div>
          </div>
        </div>

        {/* 核心三栏手账卡片 (Tactile Moleskine Journal Container) */}
        <form
          onSubmit={handleSave}
          className="bg-white/90 backdrop-blur-2xl rounded-[2.2rem] border border-white/95 shadow-[0_16px_50px_rgba(34,67,55,0.06)] p-6 sm:p-9 space-y-7 transition-all"
        >
          {/* 步骤 1：客观触发情境 (Activating Event) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF9F7] border border-stone-200/70 space-y-2.5 transition-all focus-within:border-[#4D7A68]/40 focus-within:bg-white focus-within:shadow-[0_6px_20px_rgba(77,122,104,0.06)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EF] text-[#224337] flex items-center justify-center text-[11px] font-bold shadow-2xs">
                  1
                </span>
                <span>客观触发事件 (A · Activating Event)</span>
              </label>
              <span className="text-[11px] text-stone-400">仅描述发生了什么事实，去除主观推论</span>
            </div>
            <textarea
              rows={3}
              value={eventTrigger}
              onChange={e => setEventTrigger(e.target.value)}
              placeholder="例：今天上午向团队提交了新的提案，截止下午下班依然没有收到任何同事的正面反馈..."
              className="w-full bg-white/80 hover:bg-white focus:bg-white border border-stone-200/70 focus:border-[#4D7A68]/50 rounded-xl p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#4D7A68]/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* 步骤 2：消极自动念头与思维滤镜 (Automatic Beliefs & Distortions) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FCFAF8] border border-[#E8D9C0]/70 space-y-3.5 transition-all focus-within:border-[#C99A5B]/50 focus-within:bg-white focus-within:shadow-[0_6px_20px_rgba(201,154,91,0.08)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#73582A] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FAF3E8] text-[#8C6228] flex items-center justify-center text-[11px] font-bold shadow-2xs">
                  2
                </span>
                <span>消极自动念头 (B · Automatic Thoughts)</span>
              </label>
              <span className="text-[11px] text-stone-400">脑海中蹦出的第一句严苛独白或最坏推测</span>
            </div>
            <textarea
              rows={3}
              value={negativeThought}
              onChange={e => setNegativeThought(e.target.value)}
              placeholder="例：他们肯定觉得我写的东西毫无价值、水平很次，我这次肯定要被边缘化了..."
              className="w-full bg-white/80 hover:bg-white focus:bg-white border border-stone-200/70 focus:border-[#C99A5B]/50 rounded-xl p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#C99A5B]/10 transition-all resize-none leading-relaxed"
            />

            {/* 灵动交互认知偏差药丸标签 (Interactive Distortion Chips) */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] text-stone-500 block font-medium">
                识别并打捞此刻正在作祟的思维滤镜：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DISTORTIONS.map(d => {
                  const isSelected = distortionTag === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistortionTag(d)}
                      className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF3E8] text-[#73582A] font-medium border border-[#D9BD93] shadow-[0_2px_10px_rgba(201,154,91,0.2)] scale-[1.03]'
                          : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/70 hover:border-stone-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 步骤 3：理性替代信念 (Rational Reframing) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F7FAF8] border border-[#4D7A68]/20 space-y-3.5 transition-all focus-within:border-[#4D7A68]/60 focus-within:bg-white focus-within:shadow-[0_6px_20px_rgba(77,122,104,0.08)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#224337] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EF] text-[#224337] flex items-center justify-center text-[11px] font-bold shadow-2xs">
                  3
                </span>
                <span>理性替代信念 (C · Rational Reframing)</span>
              </label>

              {/* 导师启发按钮 */}
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isAiLoading}
                className="text-xs text-[#224337] hover:text-[#1a352b] font-medium flex items-center gap-1.5 bg-gradient-to-r from-white to-[#F5F8F6] hover:from-white hover:to-white border border-[#4D7A68]/30 hover:border-[#4D7A68]/60 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C99A5B] animate-spin" style={{ animationDuration: isAiLoading ? '1s' : '0s' }} />
                <span>{isAiLoading ? '导师深思提炼中...' : '导师启发理性视角'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={rationalThought}
              onChange={e => setRationalThought(e.target.value)}
              placeholder="例：大家周五都在赶月度结项，未及时回复是常态；同事的一时忙碌绝不等于否定我个人的能力，我随时可以主动温和跟进..."
              className="w-full bg-white/80 hover:bg-white focus:bg-white border border-stone-200/70 focus:border-[#4D7A68]/50 rounded-xl p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#4D7A68]/10 transition-all resize-none leading-relaxed"
            />

            {/* AI 建议便签面板 (Artisan Parchment Notes) */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#FAF8F5] to-[#F3EFEA] rounded-2xl border border-[#E8D9C0] space-y-2.5 animate-fade-in shadow-xs">
                <div className="text-xs font-semibold text-[#73582A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C99A5B]" />
                  <span>心理学者提炼的 3 维替代信念（点击任意一条直接填入第三栏）：</span>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRationalThought(sug)}
                      className="w-full text-left text-xs text-stone-800 bg-white/95 hover:bg-white p-3.5 rounded-xl border border-stone-200/80 hover:border-[#4D7A68]/50 transition-all shadow-2xs hover:shadow-xs leading-relaxed cursor-pointer group flex items-start justify-between gap-2"
                    >
                      <span className="leading-relaxed">{sug}</span>
                      <span className="text-[11px] text-[#4D7A68] shrink-0 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        采纳此视角 →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 情绪负荷对比标尺 (Fluid Dual Sliders with Dynamic Badge) */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-white/70 to-[#FAF9F7] rounded-2xl border border-stone-200/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-stone-700">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#C05638]" />
                <span className="font-semibold text-stone-800">身心痛苦与负荷缓解量表</span>
              </span>
              {reliefDelta > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#4D7A68] to-[#224337] text-white rounded-full font-semibold text-[11px] shadow-[0_2px_10px_rgba(34,67,55,0.18)] animate-fade-in flex items-center gap-1">
                    <span>预期释放内耗 -{reliefDelta} 分</span>
                    <span className="opacity-75 font-normal">({reliefPercentage}%)</span>
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>重塑前的主观痛苦感</span>
                  <span className="font-semibold text-[#8C6228] font-mono">{scoreBefore} 分</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreBefore}
                  onChange={e => setScoreBefore(Number(e.target.value))}
                  className="w-full accent-[#73582A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>轻微波澜 (0)</span>
                  <span>中度焦虑 (50)</span>
                  <span>极度痛苦 (100)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>重塑后的平静预期分</span>
                  <span className="font-semibold text-[#4D7A68] font-mono">{scoreAfter} 分</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreAfter}
                  onChange={e => setScoreAfter(Number(e.target.value))}
                  className="w-full accent-[#4D7A68] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>回归从容 (0)</span>
                  <span>基本接纳 (50)</span>
                  <span>仍存执念 (100)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 底部保存与归档操作条 */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <div className="flex items-center gap-1.5 text-xs text-[#224337] font-semibold bg-[#EBF3EF] px-4 py-2 rounded-full animate-fade-in border border-[#4D7A68]/30 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#4D7A68]" />
                <span>已安全归档至你的本地私密重塑长卷</span>
              </div>
            ) : (
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4D7A68]" />
                <span>端侧本地离线存储 · 无需担心任何数据外泄</span>
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-2xl text-xs font-medium shadow-[0_6px_20px_rgba(34,67,55,0.25)] transition-all active:scale-95 cursor-pointer flex items-center gap-2 group"
            >
              <span>归档此条认知重塑</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>

        {/* 历史重塑日记时间轴 (Historical Journal Leaves) */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#224337] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4D7A68]" />
              <span>历史手账长卷</span>
              <span className="text-stone-400 font-normal text-xs font-mono">({diaries.length} 篇归档)</span>
            </h3>
          </div>

          {diaries.length === 0 ? (
            <div className="text-center py-14 bg-white/70 backdrop-blur-md rounded-3xl border border-stone-200/60 text-stone-400 text-xs space-y-2">
              <Layers className="w-8 h-8 text-stone-300 mx-auto" />
              <p>手账长卷目前静待墨迹。在上方写下你的第一次三栏思维重塑吧。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diaries.map(d => {
                const diff = d.emotionScoreBefore - d.emotionScoreAfter;
                return (
                  <div
                    key={d.id}
                    className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/95 p-5 sm:p-6 shadow-[0_4px_20px_rgba(34,67,55,0.03)] space-y-3.5 hover:border-[#4D7A68]/30 hover:shadow-[0_8px_30px_rgba(34,67,55,0.08)] transition-all"
                  >
                    {/* 卡片顶栏 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-stone-400 font-mono text-[11.5px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </span>
                        {d.distortionTag && (
                          <span className="bg-[#FAF3E8] text-[#73582A] border border-[#E8D9C0] px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                            {d.distortionTag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {diff > 0 && (
                          <span className="text-[11px] text-[#224337] bg-[#EBF3EF] border border-[#4D7A68]/20 px-2.5 py-0.5 rounded-full font-medium">
                            负荷释放 -{diff}分
                          </span>
                        )}
                        <button
                          onClick={() => handleCopyRational(d.id, d.rationalThought)}
                          className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100/60 transition-colors cursor-pointer"
                          title="复制理性重塑信念"
                        >
                          {copiedId === d.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-stone-300 hover:text-[#C05638] p-1.5 rounded-lg hover:bg-stone-100/60 transition-colors cursor-pointer"
                          title="移除此记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 三栏历史对比视图 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#FAF9F7] p-3 rounded-xl border border-stone-200/60 space-y-1">
                        <span className="text-stone-400 font-medium block text-[11px]">客观事件 (A)：</span>
                        <p className="text-stone-700 leading-relaxed">
                          {d.eventTrigger}
                        </p>
                      </div>

                      <div className="bg-[#FCFAF8] p-3 rounded-xl border border-[#E8D9C0]/60 space-y-1">
                        <span className="text-[#8C6228] font-medium block text-[11px]">消极念头 (B)：</span>
                        <p className="text-stone-700 leading-relaxed">
                          {d.negativeThought}
                        </p>
                      </div>

                      <div className="bg-[#EBF3EF]/70 p-3 rounded-xl border border-[#4D7A68]/25 space-y-1">
                        <span className="text-[#224337] font-semibold block text-[11px]">理性重塑 (C)：</span>
                        <p className="text-[#224337] font-medium leading-relaxed">
                          {d.rationalThought}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
