import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sparkles, Trash2, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
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
  '灾难化思维',
  '非黑即白',
  '过度概括',
  '读心术（自认被否定）',
  '应该句式（苛求自己）',
  '情感推理',
  '个人化归因',
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
  const [distortionTag, setDistortionTag] = useState('灾难化思维');
  const [rationalThought, setRationalThought] = useState(initialRational);
  const [scoreBefore, setScoreBefore] = useState(75);
  const [scoreAfter, setScoreAfter] = useState(35);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 点击“AI 启发理性视角”
  const handleGenerateAI = async () => {
    if (!eventTrigger.trim() || !negativeThought.trim()) {
      alert('请先写下事实情境与消极念头，AI 将针对具体情境为你提供理性替代视角。');
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
      alert('请完整填写三栏内容，完成一次完整的思维重塑闭环。');
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
    setTimeout(() => setSaveSuccess(false), 2500);

    // 清空表单
    setEventTrigger('');
    setNegativeThought('');
    setRationalThought('');
    setAiSuggestions([]);
    setScoreBefore(75);
    setScoreAfter(35);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除这条重塑记录吗？')) {
      await db.diaries.delete(id);
    }
  };

  const reliefDelta = Math.max(0, scoreBefore - scoreAfter);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* 顶部标题区 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#4D7A68] tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#4D7A68]" />
            <span>CBT Reframing Journal · 认知重塑手账</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-[#224337] tracking-tight">
            拆解思维滤镜，重塑内心平和
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl">
            「决定情绪的往往不是事件本身，而是我们对事件的认知与解释。」借助认知行为疗法（CBT）三栏法，把混沌的内耗转化为清晰客观的理性信念。
          </p>
        </div>

        {/* 核心手账卡片 (White Jade & Warm Paper Aesthetic) */}
        <form
          onSubmit={handleSave}
          className="glass-sanctuary rounded-[2rem] border border-white/90 shadow-[0_12px_44px_rgba(34,67,55,0.06)] p-6 sm:p-8 space-y-6"
        >
          {/* 步骤 1：触发情境 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EF] text-[#224337] flex items-center justify-center text-[11px] font-bold">
                  1
                </span>
                <span>客观触发事件 (A: Activating Event)</span>
              </label>
              <span className="text-[11px] text-stone-400">仅写客观事实，不带主观揣测</span>
            </div>
            <textarea
              rows={3}
              value={eventTrigger}
              onChange={e => setEventTrigger(e.target.value)}
              placeholder="例：今天下午给客户发方案，过了 4 小时对方依然没有回复我..."
              className="w-full bg-white/70 hover:bg-white/95 focus:bg-white border border-stone-200/80 focus:border-[#4D7A68]/50 rounded-2xl p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#4D7A68]/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* 步骤 2：消极念头 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FCEEEA] text-[#C05638] flex items-center justify-center text-[11px] font-bold">
                  2
                </span>
                <span>消极自动念头 (B: Automatic Beliefs)</span>
              </label>
              <span className="text-[11px] text-stone-400">脑海中冒出的第一句批判或最坏推测</span>
            </div>
            <textarea
              rows={3}
              value={negativeThought}
              onChange={e => setNegativeThought(e.target.value)}
              placeholder="例：他肯定觉得我能力差又麻烦，我这次彻底搞砸了..."
              className="w-full bg-white/70 hover:bg-white/95 focus:bg-white border border-stone-200/80 focus:border-[#E07A5F]/50 rounded-2xl p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#E07A5F]/10 transition-all resize-none leading-relaxed"
            />

            {/* 灵动交互认知偏差药丸标签 (Interactive Distortion Chips) */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] text-stone-400 block font-medium">选择对应的思维滤镜（偏差类型）：</span>
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
                          ? 'bg-[#FCF7F0] text-[#73582A] font-medium border border-[#E8D9C0] shadow-[0_2px_8px_rgba(201,154,91,0.15)] scale-[1.02]'
                          : 'bg-white/60 hover:bg-white text-stone-600 border border-stone-200/60 hover:border-stone-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 步骤 3：理性替代信念 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EF] text-[#224337] flex items-center justify-center text-[11px] font-bold">
                  3
                </span>
                <span>理性替代信念 (C: Rational Reframing)</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isAiLoading}
                className="text-xs text-[#224337] hover:text-[#1a352b] font-medium flex items-center gap-1.5 bg-white/80 hover:bg-white border border-[#4D7A68]/30 px-3 py-1 rounded-full transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4D7A68]" />
                <span>{isAiLoading ? '助手体察中...' : 'AI 启发理性视角'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={rationalThought}
              onChange={e => setRationalThought(e.target.value)}
              placeholder="例：对方可能在开紧急会议，迟回复在职场是常态，并不等于全盘否定我..."
              className="w-full bg-white/70 hover:bg-white/95 focus:bg-white border border-stone-200/80 focus:border-[#4D7A68]/50 rounded-2xl p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#4D7A68]/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* AI 建议便签面板 */}
          {aiSuggestions.length > 0 && (
            <div className="p-4 sm:p-5 bg-gradient-to-br from-[#FAF8F5] to-[#F3EFEA] rounded-2xl border border-[#E8D9C0]/70 space-y-2.5 animate-fade-in shadow-xs">
              <div className="text-xs font-medium text-[#73582A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C99A5B]" />
                <span>AI 提炼的替代思维（点击任意一条直接填入第三栏）：</span>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRationalThought(sug)}
                    className="w-full text-left text-xs text-stone-800 bg-white/95 hover:bg-white p-3.5 rounded-xl border border-stone-200/70 hover:border-[#4D7A68]/40 transition-all shadow-2xs hover:shadow-xs leading-relaxed cursor-pointer group flex items-start justify-between gap-2"
                  >
                    <span>{sug}</span>
                    <span className="text-[10px] text-[#4D7A68] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      使用 →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 情绪负荷对比量表 (Fluid Dual Sliders) */}
          <div className="p-4 sm:p-5 bg-white/60 rounded-2xl border border-stone-200/60 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4D7A68]" />
                <span>情绪痛苦度对比量表</span>
              </span>
              {reliefDelta > 0 && (
                <span className="px-3 py-1 bg-gradient-to-r from-[#4D7A68] to-[#224337] text-white rounded-full font-semibold text-[11px] shadow-[0_2px_8px_rgba(34,67,55,0.15)] animate-fade-in">
                  预期心理负荷缓解 -{reliefDelta} 分
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>重塑前痛苦度</span>
                  <span className="font-semibold text-stone-800">{scoreBefore} 分</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreBefore}
                  onChange={e => setScoreBefore(Number(e.target.value))}
                  className="w-full accent-[#224337] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>重塑后预期分</span>
                  <span className="font-semibold text-[#4D7A68]">{scoreAfter} 分</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreAfter}
                  onChange={e => setScoreAfter(Number(e.target.value))}
                  className="w-full accent-[#4D7A68] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 底部保存操作 */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <div className="flex items-center gap-1.5 text-xs text-[#224337] font-semibold bg-[#EBF3EF] px-3.5 py-1.5 rounded-full animate-fade-in border border-[#4D7A68]/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7A68]" />
                <span>已安全归档至本地重塑手账</span>
              </div>
            ) : (
              <span className="text-xs text-stone-400">端侧加密存储 · 离线随时可读</span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-2xl text-xs font-medium shadow-[0_4px_16px_rgba(34,67,55,0.25)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>归档此条认知重塑</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* 历史重塑日记时间轴 */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#224337] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4D7A68]" />
              <span>历史手账记录</span>
              <span className="text-stone-400 font-normal text-xs">({diaries.length})</span>
            </h3>
          </div>

          {diaries.length === 0 ? (
            <div className="text-center py-12 glass-sanctuary rounded-3xl border border-white/80 text-stone-400 text-xs">
              暂无记录。在上方写下你的第一次三栏思维重塑吧。
            </div>
          ) : (
            <div className="space-y-3.5">
              {diaries.map(d => {
                const diff = d.emotionScoreBefore - d.emotionScoreAfter;
                return (
                  <div
                    key={d.id}
                    className="glass-sanctuary rounded-2xl border border-white/90 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3 hover:border-[#4D7A68]/30 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-stone-400 font-mono text-[11px]">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                        {d.distortionTag && (
                          <span className="bg-[#FCF7F0] text-[#73582A] border border-[#E8D9C0] px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                            {d.distortionTag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {diff > 0 && (
                          <span className="text-[11px] text-[#224337] bg-[#EBF3EF] border border-[#4D7A68]/20 px-2.5 py-0.5 rounded-full font-medium">
                            负荷缓解 -{diff}分
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-stone-300 hover:text-[#C05638] p-1.5 rounded-lg hover:bg-stone-100/60 transition-colors cursor-pointer"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-stone-400 block mb-0.5 font-medium">客观事实：</span>
                        <p className="text-stone-700 leading-relaxed bg-white/50 p-2.5 rounded-xl border border-stone-100">
                          {d.eventTrigger}
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 font-medium">消极念头：</span>
                        <p className="text-stone-700 leading-relaxed bg-white/50 p-2.5 rounded-xl border border-stone-100">
                          {d.negativeThought}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#224337] block mb-0.5 font-medium">理性重塑：</span>
                        <p className="text-[#224337] font-medium leading-relaxed bg-[#EBF3EF]/60 p-3 rounded-xl border border-[#4D7A68]/20">
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