import React, { useState } from 'react';
import { PRESET_ROUTES } from '../../data/seedData';
import { RouteOption, TamilNaduCity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import {
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Sun,
  Droplets,
  TreePine,
  Navigation,
  X,
} from 'lucide-react';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: TamilNaduCity;
  onSelectRoute: (heatSafe: RouteOption, fastest: RouteOption) => void;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectRoute,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  // Default preset based on city
  const defaultKey =
    selectedCity === 'madurai'
      ? 'mdu-gori-mattu'
      : selectedCity === 'coimbatore'
      ? 'cbe-gandhi-rspuram'
      : 'chn-guindy-tnagar';

  const [selectedRouteKey, setSelectedRouteKey] = useState<string>(defaultKey);
  const [chosenOption, setChosenOption] = useState<'heat_safe' | 'fastest'>('heat_safe');

  if (!isOpen) return null;

  const currentPreset = PRESET_ROUTES[selectedRouteKey] || PRESET_ROUTES['chn-guindy-tnagar'];

  const handleStart = () => {
    onSelectRoute(currentPreset.heatSafe, currentPreset.fastest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Navigation className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{t.planRoute}</h3>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'கடுமையான வெயிலை தவிர்த்து பராமரிப்பு மையங்கள் வழியே செல்லுங்கள்'
                  : 'Prioritizing toilets, cold water & shaded tree stretches'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Preset Corridor Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {language === 'ta' ? 'டெலிவரி வழித்தடத்தை தேர்வு செய்யவும்:' : 'Select Gig Work Corridor:'}
            </label>
            <select
              value={selectedRouteKey}
              onChange={(e) => setSelectedRouteKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
            >
              {Object.entries(PRESET_ROUTES).map(([key, data]) => (
                <option key={key} value={key}>
                  {language === 'ta' ? data.labelTa : data.label}
                </option>
              ))}
            </select>
          </div>

          {/* Route Options Comparison Card */}
          <div className="space-y-3 pt-2">
            {/* Option 1: Heat-Safe Route (RECOMMENDED) */}
            <div
              onClick={() => setChosenOption('heat_safe')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                chosenOption === 'heat_safe'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center p-0.5">
                    {chosenOption === 'heat_safe' && (
                      <div className="w-full h-full rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {language === 'ta'
                          ? currentPreset.heatSafe.nameTa
                          : currentPreset.heatSafe.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      {t.heatSafeDesc}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-emerald-400">
                    {currentPreset.heatSafe.travelTimeMinutes} {t.minutes}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentPreset.heatSafe.distanceKm} {t.km}
                  </div>
                </div>
              </div>

              {/* Highlights pills */}
              <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <TreePine className="w-3.5 h-3.5" />
                  <span>45% Tree Shade</span>
                </span>
                <span className="inline-flex items-center gap-1 text-cyan-300">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>3 Care Points (Toilets & Water)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Heat Risk: Low (28/100)</span>
                </span>
              </div>
            </div>

            {/* Option 2: Fastest Direct Route (Unshaded, Risk) */}
            <div
              onClick={() => setChosenOption('fastest')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                chosenOption === 'fastest'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center p-0.5">
                    {chosenOption === 'fastest' && (
                      <div className="w-full h-full rounded-full bg-amber-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-200">
                      {language === 'ta'
                        ? currentPreset.fastest.nameTa
                        : currentPreset.fastest.name}
                    </span>
                    <p className="text-xs text-amber-200/70 mt-1">
                      {t.fastestDesc}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-amber-400">
                    {currentPreset.fastest.travelTimeMinutes} {t.minutes}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentPreset.fastest.distanceKm} {t.km}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Heat Exposure: Extreme (89/100)</span>
                </span>
                <span className="text-slate-400">0 Verified Water Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Navigation className="w-4 h-4 text-slate-950" />
            <span>{t.startNav}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
