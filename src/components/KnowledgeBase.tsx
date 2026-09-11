import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ShieldAlert,
  GraduationCap,
  Layers,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Compass,
} from 'lucide-react';
import {
  THEORY_SCHOOLS,
  MICRO_TECHNIQUES,
  CLINICAL_CASES,
  TECHNIQUE_TEMPLATES,
  CRISIS_SOP,
  ACADEMIC_DATASETS,
} from '../data/knowledgeBase';

interface KnowledgeBaseProps {
  onStartTopic: (prompt?: string) => void;
}

type SectionFilter = 'all' | 'schools' | 'techniques' | 'cases' | 'templates' | 'crisis' | 'datasets';

export const KnowledgeBaseComponent: React.FC<KnowledgeBaseProps> = ({ onStartTopic }) => {
  const [activeFilter, setActiveFilter] = useState<SectionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({
    'depression-paralysis': true,
    'catastrophic-anxiety': true,
  });
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);

  const toggleCase = (id: string) => {
    setExpandedCases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyTemplate = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateIdx(idx);
    setTimeout(() => setCopiedTemplateIdx(null), 2000);
  };

  const q = searchQuery.trim().toLowerCase();

  // 过滤数据
  const filteredSchools = useMemo(() => {
    if (!q) return THEORY_SCHOOLS;
    return THEORY_SCHOOLS.filter(
      s => s.name.toLowerCase().includes(q) || s.en.toLowerCase().includes(q) || s.scenarios.toLowerCase().includes(q)
    );
  }, [q]);

  const filteredCases = useMemo(() => {
    if (!q) return CLINICAL_CASES;
    return CLINICAL_CASES.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.clientBackground.toLowerCase().includes(q) ||
        c.dialogue.some(d => d.text.toLowerCase().includes(q))
    );
  }, [q]);

  const filteredTemplates = useMemo(() => {
    if (!q) return TECHNIQUE_TEMPLATES;
    return TECHNIQUE_TEMPLATES.filter(
      t =>
        t.technique.toLowerCase().includes(q) ||
        t.template.toLowerCase().includes(q) ||
        t.phase.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 relative bg-radial-at-t from-[#FBFBFA] via-[#FAF9F6] to-[#F5F4F0]">
      {/* 柔光流韵背景氛围光晕 */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#4D7A68]/8 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/3 right-10 w-88 h-88 bg-[#C99A5B]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
        {/* 顶部标题与检索栏 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11.5px] font-mono font-medium text-[#4D7A68] tracking-widest uppercase">
            <GraduationCap className="w-4 h-4 text-[#4D7A68]" />
            <span>Psychological Counseling & Dialogue Techniques Knowledge Base</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#224337] tracking-tight">
                心理咨询与对话技术专业知识库
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
                融汇 CBT、人本主义、精神分析、接纳承诺（ACT）五大主流流派，涵盖临床常见议题逐字稿、咨询微技术谱系、标准化话术模板与伦理危机干预 SOP。
              </p>
            </div>
            <span className="text-xs text-stone-400 font-mono shrink-0">
              权威循证 · 教学与临床参考
            </span>
          </div>

          {/* 实时搜索与分类过滤胶囊 */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索流派、微技术、临床议题逐字稿、话术模板（如：行为激活、去灾难化、课题分离）..."
                className="w-full bg-white/90 hover:bg-white focus:bg-white border border-stone-200/80 focus:border-[#4D7A68]/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-4 focus:ring-[#4D7A68]/10 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  清除
                </button>
              )}
            </div>

            {/* 分类快捷筛选 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'all', label: '全部典藏', icon: '🌟' },
                { key: 'cases', label: '对话逐字稿', icon: '💬' },
                { key: 'templates', label: '话术模板', icon: '📜' },
                { key: 'schools', label: '治疗流派', icon: '🏛️' },
                { key: 'techniques', label: '微技术谱系', icon: '🧭' },
                { key: 'crisis', label: '危机干预 SOP', icon: '🛡️' },
                { key: 'datasets', label: '学术数据集', icon: '📚' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key as SectionFilter)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === tab.key
                      ? 'bg-[#224337] text-white shadow-xs'
                      : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/70'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1. 模块二：临床常见议题标准化对话语料库 (优先展示，最直观实用) */}
        {(activeFilter === 'all' || activeFilter === 'cases') && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#224337] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#4D7A68]" />
                <span>模块二 · 临床常见议题标准化对话语料库</span>
                <span className="text-xs text-stone-400 font-mono font-normal">({filteredCases.length} 组案例)</span>
              </h3>
            </div>

            <div className="space-y-5">
              {filteredCases.map(c => {
                const isExpanded = expandedCases[c.id] ?? false;
                const firstClientStatement = c.dialogue[0]?.text || '';

                return (
                  <div
                    key={c.id}
                    className="bg-white/90 backdrop-blur-xl border border-white/95 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(34,67,55,0.04)] space-y-4 hover:border-[#4D7A68]/30 transition-all"
                  >
                    {/* 案例头部 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-semibold text-stone-800">
                            {c.title}
                          </span>
                          <span className="text-[11px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full border border-[#4D7A68]/20">
                            {c.tag}
                          </span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            {c.subTag}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          <span className="font-medium text-stone-700">来访背景：</span>
                          {c.clientBackground}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* 一键开启沉浸探讨 */}
                        <button
                          onClick={() => onStartTopic(firstClientStatement)}
                          className="px-3 py-1.5 rounded-xl bg-[#224337] hover:bg-[#1a352b] text-white text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                          title="把该议题带入对话疏导工作台进行模拟练习"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                          <span>以此案例练习</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => toggleCase(c.id)}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          title={isExpanded ? '收起逐字稿' : '展开完整逐字稿'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 临床洞见引文 */}
                    <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-[#E8D9C0]/70 text-xs text-[#73582A] leading-relaxed flex items-start gap-2.5">
                      <Bookmark className="w-4 h-4 text-[#C99A5B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">核心干预机制：</span>
                        <span>{c.therapeuticInsight}</span>
                      </div>
                    </div>

                    {/* 逐字稿对话流 */}
                    {isExpanded && (
                      <div className="space-y-3.5 pt-2 animate-fade-in">
                        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider pl-1">
                          临床微观逐字稿实录 (Clinical Verbatim Transcript)：
                        </div>

                        {c.dialogue.map((item, idx) => {
                          const isClient = item.speaker === 'client';
                          return (
                            <div
                              key={idx}
                              className={`flex gap-3 text-xs leading-relaxed ${
                                isClient ? 'items-start' : 'items-start pl-2 sm:pl-4'
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-medium text-[11px] shadow-2xs mt-0.5 ${
                                  isClient
                                    ? 'bg-[#FAF3E8] text-[#8C6228] border border-[#E8D9C0]'
                                    : 'bg-[#EBF3EF] text-[#224337] border border-[#4D7A68]/30 font-bold'
                                }`}
                              >
                                {isClient ? '客' : '师'}
                              </div>

                              <div
                                className={`flex-1 rounded-2xl p-3.5 space-y-1.5 ${
                                  isClient
                                    ? 'bg-[#FAF9F7] border border-stone-200/70 text-stone-700'
                                    : 'bg-white/95 border border-[#4D7A68]/25 text-[#224337] shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-[11px] text-stone-500">
                                    {isClient ? '来访者 (Client)' : '咨询师 (Counselor)'}
                                  </span>
                                  {item.technique && (
                                    <span className="text-[10.5px] font-medium text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-md border border-[#4D7A68]/20">
                                      💡 {item.technique}
                                    </span>
                                  )}
                                </div>
                                <p className="leading-relaxed font-sans">{item.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. 模块三：咨询师标准化微技术话术模板库 */}
        {(activeFilter === 'all' || activeFilter === 'templates') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#224337] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#4D7A68]" />
                <span>模块三 · 咨询师标准化微技术话术模板库</span>
                <span className="text-xs text-stone-400 font-mono font-normal">({filteredTemplates.length} 条模板)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((tpl, idx) => (
                <div
                  key={idx}
                  className="bg-white/85 backdrop-blur-xl border border-white/95 rounded-2xl p-4.5 space-y-2.5 shadow-[0_4px_20px_rgba(34,67,55,0.03)] hover:border-[#4D7A68]/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded-md">
                        {tpl.phase}
                      </span>
                      <span className="text-xs font-semibold text-stone-700">
                        {tpl.technique}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed italic bg-stone-50/90 p-3 rounded-xl border border-stone-100">
                      {tpl.template}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                    <span className="text-stone-400 line-clamp-1 mr-2">
                      💡 {tpl.rationale}
                    </span>
                    <button
                      onClick={() => handleCopyTemplate(idx, tpl.template)}
                      className="text-stone-400 hover:text-[#224337] flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      title="复制此话术模板"
                    >
                      {copiedTemplateIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-400" />
                          <span>复制话术</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. 模块一：五大主流治疗流派核心矩阵 */}
        {(activeFilter === 'all' || activeFilter === 'schools') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#224337] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#4D7A68]" />
                <span>模块一 (1.1) · 主流治疗流派核心干预矩阵</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSchools.map(school => (
                <div
                  key={school.id}
                  className="bg-white/85 backdrop-blur-xl border border-white/95 rounded-2xl p-5 space-y-3 shadow-[0_4px_20px_rgba(34,67,55,0.03)] hover:border-[#4D7A68]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">
                        {school.name}
                      </h4>
                      <span className="text-[10.5px] text-stone-400 font-mono">
                        {school.en}
                      </span>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${school.badgeColor}`}>
                      {school.representative}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed">
                    <div>
                      <span className="text-stone-400 block font-medium">核心哲学假设：</span>
                      <p className="text-stone-700 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                        {school.coreAssumption}
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium">关键机制与目标：</span>
                      <p className="text-stone-600">
                        {school.mechanism}
                      </p>
                    </div>
                    <div className="pt-1 text-[11.5px] text-[#4D7A68]">
                      <span className="font-semibold">常见适用：</span>
                      <span>{school.scenarios}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. 模块一 (1.2)：咨询师核心微技术谱系 */}
        {(activeFilter === 'all' || activeFilter === 'techniques') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#224337] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#4D7A68]" />
                <span>模块一 (1.2) · 咨询师核心微技术谱系</span>
              </h3>
            </div>

            <div className="space-y-4">
              {MICRO_TECHNIQUES.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-white/85 backdrop-blur-xl border border-white/95 rounded-2xl p-5 space-y-3 shadow-[0_4px_20px_rgba(34,67,55,0.03)]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-800 text-xs sm:text-sm">
                      {cat.category}
                    </span>
                    <span className="text-[11px] text-[#4D7A68] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full font-medium">
                      {cat.enCategory}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cat.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="bg-[#FAF9F7] p-3.5 rounded-xl border border-stone-200/70 space-y-2 text-xs"
                      >
                        <div className="font-semibold text-stone-800">
                          {item.name}
                        </div>
                        <p className="text-stone-500 leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="text-[11px] text-[#224337] bg-white p-2 rounded-lg border border-stone-200/60 leading-snug">
                          <span className="font-medium">范例：</span>{item.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. 模块四：伦理红线与危机干预 SOP */}
        {(activeFilter === 'all' || activeFilter === 'crisis') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#9C3D26] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#E07A5F]" />
                <span>模块四 · 伦理红线与危机干预 SOP（自杀/自伤风险）</span>
              </h3>
            </div>

            <div className="bg-[#FFF8F6] border border-[#F5D5CE] rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgba(224,122,95,0.08)]">
              {/* 保密例外原则 */}
              <div>
                <h4 className="text-xs font-semibold text-[#9C3D26] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
                  <span>4.1 保密例外原则 (Exceptions to Confidentiality)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {CRISIS_SOP.confidentialityExceptions.map((ex, i) => (
                    <div key={i} className="bg-white/90 p-3.5 rounded-xl border border-[#F5D5CE] space-y-1">
                      <div className="font-semibold text-[#9C3D26]">{ex.title}</div>
                      <p className="text-stone-600 leading-relaxed">{ex.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* C-SSRS 四步递进提问法 */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-[#9C3D26] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
                  <span>4.2 危机干预四步提问法（Columbia-Suicide Severity 评估逻辑）</span>
                </h4>
                <div className="space-y-2.5">
                  {CRISIS_SOP.cssrsSteps.map((step, idx) => (
                    <div key={idx} className="bg-white/95 p-3.5 rounded-xl border border-[#F5D5CE] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-[#9C3D26] mr-2">{step.step}</span>
                        <span className="text-stone-700 italic">{step.question}</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#7A4032] bg-[#FCEEEA] px-2.5 py-0.5 rounded-md shrink-0">
                        {step.aim}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-[#F5D5CE]">
                <span>官方全天候心理危机干预免费热线：<strong>400-161-9995</strong></span>
                <span className="text-stone-400">生命守护 · 优先干预</span>
              </div>
            </div>
          </section>
        )}

        {/* 6. 模块五：数字化语料库与学术数据集索引 */}
        {(activeFilter === 'all' || activeFilter === 'datasets') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#224337] flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[#4D7A68]" />
                <span>模块五 · 数字化语料库与学术研究数据集</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACADEMIC_DATASETS.map((ds, i) => (
                <div
                  key={i}
                  className="bg-white/85 backdrop-blur-xl border border-white/95 rounded-2xl p-4.5 space-y-2 shadow-[0_4px_20px_rgba(34,67,55,0.03)] text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{ds.name}</span>
                    <span className="text-[10.5px] text-[#4D7A68] bg-[#EBF3EF] px-2 py-0.5 rounded font-medium">
                      {ds.scale}
                    </span>
                  </div>
                  <div className="text-stone-400 font-medium">{ds.institution}</div>
                  <p className="text-stone-600 leading-relaxed">{ds.description}</p>
                  <div className="pt-1 text-[11px] font-mono text-[#73582A]">
                    {ds.linkOrCitation}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
