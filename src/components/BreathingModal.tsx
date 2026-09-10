import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundTherapy } from '../utils/audio';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (soundTherapy.isPlaying) soundTherapy.stop();
      setIsAudioActive(false);
      return;
    }

    let currentPhase: BreathPhase = 'inhale';
    let currentSeconds = 4;

    const interval = setInterval(() => {
      currentSeconds -= 1;

      if (currentSeconds <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          currentSeconds = 7;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          currentSeconds = 8;
        } else {
          currentPhase = 'inhale';
          currentSeconds = 4;
        }
        setPhase(currentPhase);
      }

      setCountdown(currentSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleSound = () => {
    if (isAudioActive) {
      soundTherapy.stop();
      setIsAudioActive(false);
    } else {
      soundTherapy.playRain();
      setIsAudioActive(true);
    }
  };

  if (!isOpen) return null;

  const phaseConfig = {
    inhale: {
      text: '缓慢深吸气...',
      sub: '让新鲜空气充满腹腔，感受胸廓如林间晨风般微微舒展',
      scale: 'scale-125 duration-4000',
      color: 'from-[#4D7A68] to-[#224337]',
      ring: 'border-[#689D86]/40 ring-20 ring-[#4D7A68]/15',
    },
    hold: {
      text: '屏息静守...',
      sub: '在定静中倾听心跳，接纳身心当下所有的感受',
      scale: 'scale-125 duration-7000',
      color: 'from-[#C99A5B] to-[#B37F40]',
      ring: 'border-[#E5BE8A]/50 ring-28 ring-[#C99A5B]/20 animate-pulse',
    },
    exhale: {
      text: '长缓吐气...',
      sub: '将所有的紧绷、忧虑与疲惫随气息彻底呼出体外',
      scale: 'scale-90 duration-8000',
      color: 'from-[#4D7A68] to-[#395D4E]',
      ring: 'border-[#4D7A68]/30 ring-10 ring-[#4D7A68]/10',
    },
  }[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1E17]/65 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-[#FBFBFA]/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_24px_64px_rgba(15,30,23,0.35)] max-w-lg w-full p-8 sm:p-9 border border-white/90 flex flex-col items-center text-center overflow-hidden">
        {/* 背景柔和光晕装饰 */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#4D7A68]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#C99A5B]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 顶部操作条 */}
        <div className="w-full flex items-center justify-between mb-6 z-10">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-[#224337] text-white shadow-sm'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-[#4D7A68]/20'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioActive ? '细雨白噪·播放中' : '伴奏：静谧细雨'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 bg-white/70 hover:bg-white rounded-full transition-colors border border-stone-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 呼吸球动效核心区 */}
        <div className="my-6 relative flex items-center justify-center w-64 h-64">
          <div
            className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr ${phaseConfig.color} shadow-[0_16px_40px_rgba(34,67,55,0.25)] opacity-95 transition-transform ease-out flex items-center justify-center text-white ${phaseConfig.scale} ${phaseConfig.ring}`}
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl font-light tracking-widest font-mono">{countdown}</span>
              <span className="text-xs uppercase tracking-wider opacity-80 mt-0.5 font-mono">秒</span>
            </div>
          </div>
        </div>

        {/* 引导文案 */}
        <div className="space-y-2 z-10 mt-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#224337] text-xs font-semibold border border-[#4D7A68]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#4D7A68]" /> 4-7-8 深度神经平复呼吸法
          </div>
          <h3 className="text-2xl font-medium text-[#224337] tracking-tight transition-all">
            {phaseConfig.text}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
            {phaseConfig.sub}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-7 px-7 py-2.5 bg-[#224337] hover:bg-[#1a352b] text-white rounded-2xl text-xs font-medium transition-all shadow-[0_4px_16px_rgba(34,67,55,0.25)] active:scale-95 z-10 cursor-pointer"
        >
          心绪已平静，返回港湾
        </button>
      </div>
    </div>
  );
};