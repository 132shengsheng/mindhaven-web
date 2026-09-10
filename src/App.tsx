import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  MessageSquare,
  BookOpen,
  Settings,
  HeartHandshake,
  Sparkles,
  Wind,
  Plus,
  Trash2,
  PanelLeft,
  X,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { db, initDatabaseDefaults } from './db';
import { LandingShowcase } from './components/LandingShowcase';
import { ChatWorkbench } from './components/ChatWorkbench';
import { CBTDiaryComponent } from './components/CBTDiary';
import { CrisisModal } from './components/CrisisModal';
import { SettingsModal } from './components/SettingsModal';
import { BreathingModal } from './components/BreathingModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'chat' | 'diary'>('showcase');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [crisisPhrase, setCrisisPhrase] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  // 会话状态管理
  const sessions = useLiveQuery(() => db.sessions.orderBy('updatedAt').reverse().toArray(), []) || [];
  const [currentSessionId, setCurrentSessionId] = useState<string>('welcome-session');

  // 跨组件传递：从对话中提炼到日记的预填状态
  const [prefillDiary, setPrefillDiary] = useState<{
    event: string;
    thought: string;
    rational?: string;
  }>({ event: '', thought: '', rational: '' });

  useEffect(() => {
    initDatabaseDefaults();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !sessions.find(s => s.id === currentSessionId)) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  // 全局快捷键 ⌘K / Ctrl+K 开启新倾诉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewSession = async () => {
    const newId = 'session-' + Date.now();
    await db.sessions.add({
      id: newId,
      title: '新的倾诉与疏导',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cbtStage: 1,
    });
    await db.messages.add({
      id: 'msg-' + Date.now(),
      sessionId: newId,
      role: 'assistant',
      content: '深呼吸，慢慢放松下来。这里是专属于你一个人的安全港湾。今天最让你感到困扰或情绪波动的事情是什么呢？随心写下来就好。',
      cbtStage: 1,
      createdAt: Date.now(),
    });
    setCurrentSessionId(newId);
    setActiveTab('chat');
  };

  const handleStartTopic = async (prompt?: string) => {
    if (!prompt) {
      setActiveTab('chat');
      return;
    }
    const newId = 'session-' + Date.now();
    const title = prompt.length > 15 ? prompt.slice(0, 15) + '...' : prompt;
    await db.sessions.add({
      id: newId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cbtStage: 1,
    });
    await db.messages.add({
      id: 'msg-u-' + Date.now(),
      sessionId: newId,
      role: 'user',
      content: prompt,
      cbtStage: 1,
      createdAt: Date.now(),
    });
    setCurrentSessionId(newId);
    setActiveTab('chat');
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert('请至少保留一个倾诉会话。');
      return;
    }
    if (confirm('确定删除此段倾诉足迹吗？')) {
      await db.sessions.delete(id);
      await db.messages.where('sessionId').equals(id).delete();
      const remain = sessions.filter(s => s.id !== id);
      if (remain.length > 0 && currentSessionId === id) {
        setCurrentSessionId(remain[0].id);
      }
    }
  };

  const handleTriggerCrisis = (phrase?: string) => {
    setCrisisPhrase(phrase);
    setIsCrisisOpen(true);
  };

  const handleExportToDiary = (event: string, thought: string, rational?: string) => {
    setPrefillDiary({ event, thought, rational });
    setActiveTab('diary');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#FBFBFA] text-[#2D3748] antialiased font-sans select-none relative">
      {/* 慢速呼吸流动极光环境光斑 (3 组超大半径柔焦流体渐变球 + 120px 柔光) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-36 -left-36 w-[560px] h-[560px] rounded-full bg-[#E8F0EA]/70 blur-[120px] animate-aurora-1" />
        <div className="absolute top-1/3 -right-36 w-[620px] h-[620px] rounded-full bg-[#F7F3EB]/80 blur-[130px] animate-aurora-2" />
        <div className="absolute -bottom-36 left-1/4 w-[580px] h-[580px] rounded-full bg-[#EBF1F5]/70 blur-[120px] animate-aurora-3" />
      </div>

      {/* 柔和微质感噪点 (1.5% Noise Overlay - 模拟实体纸张与温泉水汽) */}
      <div className="fixed inset-0 pointer-events-none noise-overlay z-0" />

      {/* 移动端侧边栏遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 沉浸式左侧侧边栏 (Mindful Sidebar - 边缘贴合式原生架构) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-68 bg-[#F5F4F0]/85 backdrop-blur-xl border-r border-stone-200/60 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-68'
        }`}
      >
        {/* 侧栏顶部品牌 */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-200/50">
          <div
            onClick={() => setActiveTab('showcase')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#224337] to-[#366352] text-[#EAF2ED] flex items-center justify-center shadow-[0_4px_16px_rgba(34,67,55,0.18)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-900 text-sm tracking-tight font-serif">MindHaven</span>
                <span className="text-[10px] text-[#4D7A68] bg-[#EAF2ED] px-1.5 py-0.2 rounded font-medium">CBT</span>
              </div>
              <p className="text-[10.5px] text-stone-400 font-normal">温润亲生命流光心理空间</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 品牌宣传与探索主页入口 */}
        <div className="px-3.5 pt-3.5 pb-1">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'showcase'
                ? 'bg-[#224337] text-white shadow-[0_4px_16px_rgba(34,67,55,0.25)]'
                : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200/70 shadow-2xs hover:shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'showcase' ? 'text-emerald-300' : 'text-[#4D7A68]'}`} />
              <span>品牌主页 · 探索展示</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* 开启新倾诉按钮 (温润半透微拟态卡片按钮 + 快捷键 ⌘K) */}
        <div className="px-3.5 py-1.5">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/85 hover:bg-white text-stone-800 border border-white/90 hover:border-[#4D7A68]/40 rounded-2xl text-xs font-medium transition-all shadow-[0_4px_16px_-2px_rgba(34,67,55,0.04)] hover:shadow-[0_6px_20px_-2px_rgba(34,67,55,0.08)] group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 text-stone-800 font-medium">
              <Plus className="w-3.5 h-3.5 text-[#4D7A68] group-hover:rotate-90 transition-transform duration-300" />
              <span>开启新的倾诉</span>
            </div>
            <kbd className="text-[10px] text-stone-400 border border-stone-200/80 bg-stone-50/90 px-1.5 py-0.5 rounded-md font-mono tracking-tighter">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* 倾诉足迹列表 (带透光磨砂绿薄底 + 左侧 3px 柔焦光感指示条) */}
        <div className="flex-1 overflow-y-auto px-2.5 space-y-1 mt-1">
          <div className="px-3 pt-1.5 pb-1 text-[10.5px] uppercase font-semibold text-stone-400 tracking-wider flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-stone-400" />
            <span>倾诉足迹</span>
          </div>
          {sessions.map(s => {
            const isSelected = activeTab === 'chat' && s.id === currentSessionId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSessionId(s.id);
                  setActiveTab('chat');
                }}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAF2ED]/85 text-[#224337] font-medium shadow-[0_2px_10px_rgba(34,67,55,0.03)] border border-emerald-900/5'
                    : 'text-stone-600 hover:bg-white/60 hover:text-stone-900'
                }`}
              >
                {/* 左侧 3px 柔焦光感指示条 */}
                {isSelected && (
                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-[#224337] shadow-[0_0_8px_rgba(34,67,55,0.4)]" />
                )}
                <div className="flex items-center gap-2 truncate pl-1">
                  <span className="truncate tracking-wide">{s.title}</span>
                </div>
                <button
                  onClick={e => handleDeleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity"
                  title="删除此会话"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* 侧栏底部工具项 */}
        <div className="p-3 border-t border-stone-200/50 space-y-1">
          <button
            onClick={() => setIsBreathingOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:text-[#224337] hover:bg-white/70 rounded-xl transition-colors cursor-pointer group"
          >
            <Wind className="w-3.5 h-3.5 text-[#4D7A68] group-hover:rotate-45 transition-transform" />
            <span>4-7-8 呼吸静心空间</span>
          </button>

          <button
            onClick={() => setIsCrisisOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#9C3D26] hover:text-[#7C2D16] hover:bg-[#FCECE8]/60 rounded-xl transition-colors cursor-pointer"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>生命危机与援助热线</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-600 hover:text-stone-900 hover:bg-white/70 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            <span>模型与隐私设置</span>
          </button>

          {/* 底部安全加密徽标 */}
          <div className="pt-2 px-3 text-[10.5px] text-stone-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            <span>端侧沙盒加密 · 隐私零上传</span>
          </div>
        </div>
      </aside>

      {/* 右侧主工作区 (无缝光透 Canvas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* 顶部圣殿导航栏 (Header Sanctuary - 64px 玻璃折射微光) */}
        <header className="h-16 border-b border-stone-200/50 px-4 sm:px-6 flex items-center justify-between bg-white/60 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-white/70 rounded-xl transition-all cursor-pointer border border-stone-200/50 shadow-2xs"
                title="展开侧边栏"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium hidden sm:inline truncate max-w-[200px]">
                {activeTab === 'showcase'
                  ? 'MindHaven · 品牌展厅'
                  : activeTab === 'chat'
                  ? sessions.find(s => s.id === currentSessionId)?.title
                  : '认知重塑手账'}
              </span>
              {/* 微型柔色护盾徽标 */}
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF2ED]/70 text-[#2D5849] text-[10.5px] font-medium border border-[#4D7A68]/20">
                <ShieldCheck className="w-3 h-3 text-[#3C6152]" />
                <span>端侧无痕存储</span>
              </div>
            </div>
          </div>

          {/* 中心 Tabs：悬浮三段式胶囊滑块 (Segmented Slider) */}
          <div className="relative flex items-center bg-stone-200/60 p-1 rounded-2xl border border-stone-300/40 shadow-inner">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                activeTab === 'showcase'
                  ? 'text-[#224337] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3C6152]" />
              <span>探索主页</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-[#224337] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#3C6152]" />
              <span>对话疏导</span>
            </button>

            <button
              onClick={() => setActiveTab('diary')}
              className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                activeTab === 'diary'
                  ? 'text-[#224337] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#3C6152]" />
              <span>认知手账</span>
            </button>

            {/* 选中的平滑位移白玉滑块 (3 段自适应平滑滑动) */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(33.333%-3px)] bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeTab === 'showcase'
                  ? 'translate-x-0'
                  : activeTab === 'chat'
                  ? 'translate-x-[calc(100%+4px)]'
                  : 'translate-x-[calc(200%+8px)]'
              }`}
            />
          </div>

          {/* 右侧快捷按钮组 */}
          <div className="flex items-center gap-2">
            {activeTab === 'showcase' && (
              <button
                onClick={() => setActiveTab('chat')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-xl text-xs font-medium transition-all shadow-[0_4px_14px_rgba(34,67,55,0.25)] active:scale-95 cursor-pointer"
              >
                <span>进入港湾</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* 呼吸静心：轻微呼吸脉动感微绿胶囊 */}
            <button
              onClick={() => setIsBreathingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF2ED]/90 hover:bg-[#EAF2ED] text-[#224337] border border-[#4D7A68]/20 rounded-xl text-xs font-medium transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer animate-breathing-glow"
              title="4-7-8 呼吸放松法"
            >
              <Wind className="w-3.5 h-3.5 text-[#3C6152]" />
              <span className="hidden md:inline">呼吸静心</span>
            </button>

            {/* 求助热线：浅杏粉底色 + 柔和灰红字温情小胶囊 */}
            <button
              onClick={() => setIsCrisisOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#FCECE8] hover:bg-[#F8DFD8] text-[#9C3D26] border border-[#F5D5CE] rounded-xl text-xs font-medium transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="24小时官方免费心理援助热线"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span className="hidden lg:inline">援助热线</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-white/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-stone-200/50"
              title="API 与系统设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 主视口区域 */}
        <main className="flex-1 overflow-hidden flex flex-col relative select-text">
          {activeTab === 'showcase' ? (
            <LandingShowcase
              onStartChat={handleStartTopic}
              onOpenDiary={() => setActiveTab('diary')}
              onOpenBreathing={() => setIsBreathingOpen(true)}
              onOpenCrisis={() => setIsCrisisOpen(true)}
            />
          ) : activeTab === 'chat' ? (
            <ChatWorkbench
              currentSessionId={currentSessionId}
              onTriggerCrisis={handleTriggerCrisis}
              onExportToDiary={handleExportToDiary}
              onOpenBreathing={() => setIsBreathingOpen(true)}
            />
          ) : (
            <CBTDiaryComponent
              initialEvent={prefillDiary.event}
              initialThought={prefillDiary.thought}
              initialRational={prefillDiary.rational}
              onTriggerCrisis={handleTriggerCrisis}
            />
          )}
        </main>
      </div>

      {/* 4-7-8 呼吸冥想弹窗 */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      {/* 危机阻断弹窗 */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        matchedPhrase={crisisPhrase}
      />

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;