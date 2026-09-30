import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n/translations';
import { Play, Pause, RotateCcw, Droplets, Wind, ShieldCheck, CheckCircle2, Heart } from 'lucide-react';

interface HydrationRestTimerProps {
  onClose?: () => void;
}

export const HydrationRestTimer: React.FC<HydrationRestTimerProps> = ({ onClose }) => {
  const { language, user } = useAuth();
  const t = translations[language];

  const INITIAL_SECONDS = 300; // 5 minutes
  const [secondsLeft, setSecondsLeft] = useState<number>(INITIAL_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [breaksCompleted, setBreaksCompleted] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('heatsafe_breaks_count');
      return saved ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      const updated = breaksCompleted + 1;
      setBreaksCompleted(updated);
      localStorage.setItem('heatsafe_breaks_count', updated.toString());

      // Play audio chime if available in browser
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) {
        // audio context optional
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft, breaksCompleted]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((INITIAL_SECONDS - secondsLeft) / INITIAL_SECONDS) * 100;

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(INITIAL_SECONDS);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tamil Nadu Worker Health Protocol</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.cooldownTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {t.cooldownSubtitle}
        </p>
      </div>

      {/* Circular Progress & Clock */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto flex flex-col items-center justify-center my-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="text-slate-800 stroke-current"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="text-cyan-500 stroke-current transition-all duration-1000 ease-linear"
            strokeWidth="8"
            strokeDasharray={276.4}
            strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-cyan-400 font-semibold mt-1">
            {secondsLeft === 0 ? 'Break Complete! Hydrated' : t.timeRemaining}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>{secondsLeft === 0 ? 'Start Another Break' : 'Resume'}</span>
            </>
          )}
        </button>

        <button
          onClick={reset}
          title={t.resetTimer}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Vital Cooldown Checklist Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">1. Drink 250ml Water</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Rehydrate immediately with electrolyte or water</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">2. Remove Helmet</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Unbuckle helmet & collar to release head heat</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">3. Lower Heart Rate</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Sit in shade / AC lounge until pulse stabilizes</p>
          </div>
        </div>
      </div>

      {/* Daily Tracker & Motivation */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-800/80 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold text-emerald-300">
              {user?.name || 'Rider'}: You took {breaksCompleted} heat-safe breaks today
            </p>
            <p className="text-[11px] text-slate-400">Target: 4 breaks during 11 AM - 4 PM shift</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step <= breaksCompleted
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {step <= breaksCompleted ? '✓' : step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
