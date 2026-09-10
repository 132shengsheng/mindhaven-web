import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Download, Trash2, Plus, PhoneCall, Check } from 'lucide-react';
import { getStoredAISettings, saveStoredAISettings, type AISettings } from '../services/ai';
import { db, type EmergencyContact } from '../db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [aiSettings, setAiSettings] = useState<AISettings>(getStoredAISettings());
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isSavedTip, setIsSavedTip] = useState(false);

  // 新增紧急联系人表单
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAiSettings(getStoredAISettings());
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    const list = await db.emergencyContacts.toArray();
    setContacts(list);
  };

  if (!isOpen) return null;

  const handleSaveAISettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAISettings(aiSettings);
    setIsSavedTip(true);
    setTimeout(() => setIsSavedTip(false), 2000);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    await db.emergencyContacts.add({
      id: 'contact-' + Date.now(),
      name: newContactName.trim(),
      phoneNumber: newContactPhone.trim(),
      relationship: newContactRel.trim() || '亲友',
    });

    setNewContactName('');
    setNewContactPhone('');
    setNewContactRel('');
    loadContacts();
  };

  const handleDeleteContact = async (id: string) => {
    await db.emergencyContacts.delete(id);
    loadContacts();
  };

  // 导出所有本地数据
  const handleExportData = async () => {
    const sessions = await db.sessions.toArray();
    const messages = await db.messages.toArray();
    const diaries = await db.diaries.toArray();
    const contactsList = await db.emergencyContacts.toArray();

    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sessions,
      messages,
      diaries,
      emergencyContacts: contactsList,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindhaven_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 清空本地数据
  const handleClearData = async () => {
    if (confirm('警告：确定要清空本地所有会话历史与三栏日记吗？此操作无法撤销。')) {
      await db.messages.clear();
      await db.sessions.clear();
      await db.diaries.clear();
      alert('本地记录已全部重置。');
      window.location.reload();
    }
  };

  const hasApiKey = Boolean(aiSettings.apiKey && aiSettings.apiKey.trim().length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1E17]/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#FBFBFA] rounded-[2.5rem] shadow-[0_24px_64px_rgba(15,30,23,0.3)] max-w-2xl w-full max-h-[90vh] flex flex-col border border-white/90 overflow-hidden">
        {/* 标题栏 */}
        <div className="p-5 md:p-6 border-b border-[#224337]/5 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EBF3EF] text-[#224337] rounded-2xl border border-[#4D7A68]/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-[#224337]">港湾配置 · 隐私与模型设置</h3>
              <p className="text-xs text-stone-400">端侧加密 · 数据自主 · 零云端隐私上传</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主内容区域 */}
        <div className="p-6 overflow-y-auto space-y-7">
          {/* 当前模式状态卡片 */}
          <div
            className={`p-4 rounded-2xl border text-sm flex items-start gap-3.5 ${
              hasApiKey
                ? 'bg-[#EBF3EF]/80 border-[#4D7A68]/30 text-[#224337]'
                : 'bg-[#FCF7F0] border-[#E8D9C0] text-[#73582A]'
            }`}
          >
            <Shield className="w-5 h-5 shrink-0 mt-0.5 text-[#4D7A68]" />
            <div>
              <div className="font-semibold text-xs sm:text-sm">
                {hasApiKey ? '🌿 当前使用：已连接真实大模型 API' : '💡 当前使用：内置高拟真端侧离线疏导模式'}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {hasApiKey
                  ? `正通过 ${aiSettings.baseURL} 进行流式推理，API Key 仅保存在你的浏览器本地，不经任何第三方中转。`
                  : '无需任何 API Key，你可以直接体验完整的 CBT 4 步认知行为引导与三栏手账。若需更强推理能力，可在下方填入你的 API Key。'}
              </p>
            </div>
          </div>

          {/* AI 模型连接配置 */}
          <form onSubmit={handleSaveAISettings} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[#4D7A68]" />
                自定义大模型 API 配置（可选）
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-stone-400 font-medium">一键填入：</span>
                <button
                  type="button"
                  onClick={() =>
                    setAiSettings(prev => ({
                      ...prev,
                      baseURL: 'https://tokenflow.run/v1',
                      model: 'grok-3-mini-fast',
                      apiKey:
                        prev.apiKey ||
                        'sk-79a28171042020c167a29789b1048388178fb401a3d9d8cc56cfec826cc646cf',
                    }))
                  }
                  className="text-xs px-2.5 py-1 rounded-full bg-[#EBF3EF] text-[#224337] border border-[#4D7A68]/20 hover:bg-[#dfece5] transition-colors font-medium cursor-pointer"
                >
                  ⚡ TokenFlow (极速版)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAiSettings(prev => ({
                      ...prev,
                      baseURL: 'https://api.deepseek.com/v1',
                      model: 'deepseek-chat',
                    }))
                  }
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors font-medium cursor-pointer"
                >
                  🐳 DeepSeek
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAiSettings(prev => ({
                      ...prev,
                      baseURL: 'https://api.openai.com/v1',
                      model: 'gpt-4o-mini',
                    }))
                  }
                  className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors font-medium cursor-pointer"
                >
                  🤖 OpenAI
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">API Base URL</label>
                <input
                  type="text"
                  value={aiSettings.baseURL}
                  onChange={e => setAiSettings({ ...aiSettings, baseURL: e.target.value })}
                  placeholder="https://api.deepseek.com/v1"
                  className="w-full bg-white border border-stone-200 text-xs text-stone-800 rounded-2xl p-3 focus:outline-hidden focus:border-[#4D7A68] focus:ring-2 focus:ring-[#4D7A68]/10"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">模型名称 (Model)</label>
                <input
                  type="text"
                  value={aiSettings.model}
                  onChange={e => setAiSettings({ ...aiSettings, model: e.target.value })}
                  placeholder="grok-3-mini-fast"
                  className="w-full bg-white border border-stone-200 text-xs text-stone-800 rounded-2xl p-3 focus:outline-hidden focus:border-[#4D7A68] focus:ring-2 focus:ring-[#4D7A68]/10"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-stone-400">快速推荐：</span>
                  <button
                    type="button"
                    onClick={() => setAiSettings({ ...aiSettings, model: 'grok-3-mini-fast' })}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#224337] font-semibold hover:bg-[#dfece5] transition-colors cursor-pointer"
                  >
                    ⚡ grok-3-mini-fast (毫秒级响应)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSettings({ ...aiSettings, model: 'grok-4.5' })}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    grok-4.5 (深度认知)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1">API Key 密钥</label>
              <input
                type="password"
                value={aiSettings.apiKey}
                onChange={e => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-white border border-stone-200 text-xs text-stone-800 rounded-2xl p-3 focus:outline-hidden focus:border-[#4D7A68] focus:ring-2 focus:ring-[#4D7A68]/10 font-mono"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                支持兼容 OpenAI 格式的各种接口（DeepSeek, Moonshot, 本地 Ollama 等）。留空则使用内置离线引导。
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(34,67,55,0.2)] cursor-pointer active:scale-95"
              >
                {isSavedTip ? <Check className="w-3.5 h-3.5" /> : null}
                {isSavedTip ? '已保存设置' : '保存模型配置'}
              </button>
            </div>
          </form>

          {/* 紧急联系人管理 */}
          <div className="space-y-3 pt-4 border-t border-stone-200/60">
            <h4 className="text-xs font-semibold text-stone-800 flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-[#4D7A68]" />
              紧急求助联系人（生命守门人）
            </h4>
            <p className="text-xs text-stone-400">
              当极端危机被触发时，可在危机求助面板中一键快速呼叫或发送求助信息。
            </p>

            <div className="space-y-2">
              {contacts.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/70 text-xs"
                >
                  <div>
                    <span className="font-medium text-stone-800">{c.name}</span>
                    <span className="text-stone-400 ml-2">({c.relationship})</span>
                    <div className="text-stone-600 font-mono mt-0.5">{c.phoneNumber}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="text-stone-300 hover:text-[#C05638] p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 添加新联系人 */}
            <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <input
                type="text"
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                placeholder="联系人姓名"
                className="bg-white border border-stone-200 text-xs rounded-xl p-2.5 focus:outline-hidden focus:border-[#4D7A68]"
              />
              <input
                type="text"
                value={newContactPhone}
                onChange={e => setNewContactPhone(e.target.value)}
                placeholder="手机号码"
                className="bg-white border border-stone-200 text-xs rounded-xl p-2.5 focus:outline-hidden focus:border-[#4D7A68]"
              />
              <input
                type="text"
                value={newContactRel}
                onChange={e => setNewContactRel(e.target.value)}
                placeholder="关系 (如: 伴侣/朋友)"
                className="bg-white border border-stone-200 text-xs rounded-xl p-2.5 focus:outline-hidden focus:border-[#4D7A68]"
              />
              <button
                type="submit"
                className="bg-[#4D7A68] hover:bg-[#395d4e] text-white rounded-xl text-xs font-medium py-2 px-3 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> 添加
              </button>
            </form>
          </div>

          {/* 数据备份与完全清空 */}
          <div className="space-y-3 pt-4 border-t border-stone-200/60">
            <h4 className="text-xs font-semibold text-stone-800 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#4D7A68]" />
              本地数据自主掌控
            </h4>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> 导出全部数据备份 (JSON)
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="px-4 py-2 bg-[#FCEEEA] hover:bg-[#f9e2db] border border-[#E07A5F]/30 text-[#C05638] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> 清空所有本地记录
              </button>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 bg-white/70 border-t border-stone-200/60 flex justify-between items-center text-xs text-stone-400">
          <span className="font-mono text-[11px]">MindHaven Web v1.0.0 · Local-First Architecture</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#224337] hover:bg-[#1a352b] text-white rounded-xl font-medium cursor-pointer transition-all shadow-xs"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};