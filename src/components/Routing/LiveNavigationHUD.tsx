import React, { useState, useEffect } from 'react';
import { CarePoint, LiveAlert, RouteOption } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import {
  Navigation,
  Compass,
  Droplets,
  TreePine,
  Coffee,
  X,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LiveNavigationHUDProps {
  route: RouteOption;
  currentPosition?: [number, number];
  onEndNavigation: () => void;
  onSimulateStep?: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  nearbyAlert: LiveAlert | null;
  onStartCooldown: () => void;
}

export const LiveNavigationHUD: React.FC<LiveNavigationHUDProps> = ({
  route,
  currentPosition,
  onEndNavigation,
  isSimulating,
  onToggleSimulate,
  nearbyAlert,
  onStartCooldown,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(14);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-16 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
      {/* Top Turn & Status Banner */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-750 rounded-2xl p-3.5 shadow-2xl pointer-events-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Navigation className="w-6 h-6 text-emerald-400 transform rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {language === 'ta' ? 'அடுத்த கட்டம்' : 'Next Route Segment'}
              </span>
              <span className="text-xs text-slate-400">• 350m ahead</span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-white">
              {language === 'ta'
                ? 'மர நிழல் சாலையை நோக்கி நேராக செல்லவும்'
                : 'Continue straight under tree canopy corridor'}
            </h4>
          </div>
        </div>

        {/* HUD quick actions */}
        <div className="flex items-center gap-2">
          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulate}
            title={isSimulating ? 'Pause GPS simulation' : 'Simulate delivery movement along route'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSimulating
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isSimulating ? 'Simulating' : 'Simulate GPS'}
            </span>
          </button>

          {/* End Navigation */}
          <button
            onClick={onEndNavigation}
            title={t.stopNav}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proximity Alert Banner (Triggers when near care points!) */}
      {nearbyAlert && (
        <div className="bg-gradient-to-r from-cyan-950/95 to-slate-900/95 backdrop-blur-md border-2 border-cyan-500 rounded-2xl p-3.5 shadow-2xl pointer-events-auto animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500 text-slate-950 shrink-0 font-bold text-sm">
                💧
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {t.approachingFacility}
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    ~{nearbyAlert.distanceMeters || 180}m ahead
                  </span>
                </div>
                <h5 className="font-extrabold text-sm text-white mt-0.5">
                  {language === 'ta' ? nearbyAlert.titleTa : nearbyAlert.title}
                </h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  {language === 'ta' ? nearbyAlert.messageTa : nearbyAlert.message}
                </p>
              </div>
            </div>

            <button
              onClick={onStartCooldown}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 shrink-0"
            >
              Take Break Here
            </button>
          </div>
        </div>
      )}

      {/* Roadside Heat Fatigue Gauge */}
      <div className="self-end bg-slate-900/90 backdrop-blur-md border border-slate-750 px-3 py-1.5 rounded-xl shadow-xl pointer-events-auto flex items-center gap-3 text-xs text-slate-300">
        <div>
          <span className="text-slate-400">Road Shift:</span>{' '}
          <span className="font-bold text-amber-400">{elapsedMinutes} mins</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div>
          <span className="text-slate-400">Asphalt Heat:</span>{' '}
          <span className="font-bold text-red-400">~44°C</span>
        </div>
        <button
          onClick={onStartCooldown}
          className="text-amber-400 font-bold hover:underline"
        >
          {t.takeBreakNow}
        </button>
      </div>
    </div>
  );
};
