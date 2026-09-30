import React from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n/translations';
import { AlertTriangle, Clock, Droplets, Sun, ChevronRight } from 'lucide-react';

interface HeatRiskBannerProps {
  onStartBreak: () => void;
}

export const HeatRiskBanner: React.FC<HeatRiskBannerProps> = ({ onStartBreak }) => {
  const { language } = useAuth();
  const t = translations[language];

  return (
    <div className="bg-gradient-to-r from-red-950/80 via-orange-950/70 to-amber-950/80 border-y border-amber-500/30 px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5 animate-pulse">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                TN Heatwave Advisory
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-amber-200">
                {t.heatAlertHigh} • <span className="text-amber-400 font-extrabold">42.5°C</span> (Feels like 46°C)
              </h2>
            </div>
            <p className="text-xs text-amber-100/80 mt-0.5 leading-relaxed line-clamp-2 md:line-clamp-none">
              {t.heatAlertMsg}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={onStartBreak}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Droplets className="w-4 h-4 text-slate-950" />
            <span>{t.takeBreakNow}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
