import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { translations } from '../i18n/translations';
import { Language, UserRole } from '../types';
import {
  ShieldAlert,
  Flame,
  MapPin,
  BarChart3,
  User,
  Radio,
  QrCode,
  Languages,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'nav' | 'facilities' | 'planner' | 'hydration';
  setActiveTab: (tab: 'nav' | 'facilities' | 'planner' | 'hydration') => void;
  onOpenAuth: () => void;
  onOpenQR: () => void;
  onOpenAddPoint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenQR,
  onOpenAddPoint,
}) => {
  const { user, language, setLanguage, switchRole } = useAuth();
  const { isConnected, activeWorkersCount } = useRealtime();
  const t = translations[language];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                HeatSafe <span className="text-amber-400">Routes</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                TN Care Net
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs md:max-w-sm">
              {t.tamilNaduTagline}
            </p>
          </div>
        </div>

        {/* Right Actions: Sync status, Language, Role switcher, Auth */}
        <div className="flex items-center gap-2">
          {/* Realtime Live Sync status */}
          <div
            title={isConnected ? 'Connected to live Tamil Nadu care sync' : 'Reconnecting to live sync...'}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs"
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-medium">
              {isConnected ? `${activeWorkersCount} Workers Live` : 'Connecting...'}
            </span>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                language === 'ta'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                language === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-1 rounded font-bold transition-all ${
                language === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              HI
            </button>
          </div>

          {/* QR Share Button */}
          <button
            onClick={onOpenQR}
            title={t.shareQR}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Add Care Point quick button */}
          <button
            onClick={onOpenAddPoint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <span>+</span>
            <span>{t.addPlace}</span>
          </button>

          {/* User profile / login button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-200 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name[0].toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <span className="hidden sm:inline font-medium max-w-[100px] truncate">
              {user?.name || t.signIn}
            </span>
            {user?.role === 'municipal_planner' && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                Planner
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/60 py-1.5">
        <button
          onClick={() => setActiveTab('nav')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'nav'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>{t.tabNav}</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'facilities'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{t.tabFacilities}</span>
        </button>

        <button
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'hydration'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Coffee className="w-4 h-4 text-blue-400" />
          <span>{t.tabHydration}</span>
        </button>

        <button
          onClick={() => setActiveTab('planner')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'planner'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>{t.tabPlanner}</span>
        </button>
      </div>
    </header>
  );
};
