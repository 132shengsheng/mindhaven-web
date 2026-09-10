import React, { useState, useEffect } from 'react';
import { PhoneCall, HeartHandshake, ShieldAlert, X, Copy, Check } from 'lucide-react';
import { AUTHORITATIVE_HOTLINES } from '../utils/safety';
import { db, type EmergencyContact } from '../db';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedPhrase?: string;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, matchedPhrase }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      db.emergencyContacts.toArray().then(setContacts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1E17]/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#FBFBFA] rounded-[2.5rem] shadow-[0_24px_64px_rgba(15,30,23,0.3)] max-w-lg w-full overflow-hidden border border-white/90 flex flex-col max-h-[90vh]">
        {/* 顶部温润关怀横幅 (Warm Peach Caring Sanctuary) */}
        <div className="bg-gradient-to-br from-[#FDF6F3] via-[#FAF3EE] to-[#F7EFE8] border-b border-[#E07A5F]/15 p-6 sm:p-7 flex items-start gap-4">
          <div className="p-3.5 bg-[#E07A5F] text-white rounded-2xl shadow-[0_4px_16px_rgba(224,122,95,0.25)] shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-medium text-[#224337]">我们在乎你，请停下来歇一歇</h3>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              系统感知到了较强的心理负荷或危机信号。无论当下的阴霾多么沉重，请相信你绝不是独自一人承受，有许多受过专业训练的热线老师真诚期待倾听你：
            </p>
            {matchedPhrase && (
              <span className="inline-block mt-2.5 px-3 py-1 bg-white/80 text-[#C05638] text-xs rounded-full border border-[#E07A5F]/20 font-medium">
                关注词：{matchedPhrase}
              </span>
            )}
          </div>
        </div>

        {/* 滚动内容区 */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 官方免费心理干预热线 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PhoneCall className="w-4 h-4 text-[#4D7A68]" />
              <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                全国 24 小时公益心理危机援助热线
              </h4>
            </div>

            <div className="space-y-2.5">
              {AUTHORITATIVE_HOTLINES.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200/70 hover:border-[#4D7A68]/40 transition-all shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-800 text-sm">{item.name}</span>
                      <span className="text-[11px] bg-[#EBF3EF] text-[#224337] px-2 py-0.5 rounded-md font-medium border border-[#4D7A68]/15">
                        {item.available}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${item.phone}`}
                      className="px-3.5 py-1.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-[0_2px_8px_rgba(34,67,55,0.2)] transition-transform active:scale-95"
                    >
                      <PhoneCall className="w-3 h-3" /> 拨打
                    </a>
                    <button
                      onClick={() => handleCopy(item.phone)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer"
                      title="复制电话"
                    >
                      {copiedPhone === item.phone ? (
                        <Check className="w-3.5 h-3.5 text-[#4D7A68]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 预设紧急联系人 */}
          {contacts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-[#4D7A68]" />
                <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  你的信任紧急联系人
                </h4>
              </div>

              <div className="space-y-2">
                {contacts.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-200/70"
                  >
                    <div>
                      <span className="font-medium text-stone-800 text-sm">{c.name}</span>
                      <span className="text-xs text-stone-400 ml-2">({c.relationship})</span>
                      <p className="text-xs text-stone-600 font-mono mt-0.5">{c.phoneNumber}</p>
                    </div>
                    <a
                      href={`tel:${c.phoneNumber}`}
                      className="px-3 py-1.5 bg-[#4D7A68] hover:bg-[#395d4e] text-white rounded-xl text-xs font-medium flex items-center gap-1 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> 拨打
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 免责提示 */}
          <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E8D9C0]/80 text-xs text-[#73582A] leading-relaxed">
            <strong>港湾安全声明：</strong>本程序为日常轻度认知重塑与身心放松工具，无法替代执业医师或注册心理咨询师的临床诊断。如遇不可控突发危险，请直接拨打
            <strong> 120（急救）</strong>或 <strong>110（报警）</strong>。
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 bg-white/80 border-t border-stone-200/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-2xl text-xs font-medium transition-all shadow-[0_4px_16px_rgba(34,67,55,0.2)] cursor-pointer active:scale-95"
          >
            我已知晓，返回安静港湾
          </button>
        </div>
      </div>
    </div>
  );
};