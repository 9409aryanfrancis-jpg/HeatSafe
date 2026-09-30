import React from 'react';
import { CarePoint } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import {
  MapPin,
  Star,
  Shield,
  Clock,
  Navigation,
  AlertCircle,
  CheckCircle2,
  TreePine,
  Droplets,
  Wind,
} from 'lucide-react';

interface FacilityCardProps {
  point: CarePoint;
  onSelect: (point: CarePoint) => void;
  onRateReport: (point: CarePoint) => void;
  onNavigate: (point: CarePoint) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  point,
  onSelect,
  onRateReport,
  onNavigate,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const displayName = language === 'ta' && point.nameTa ? point.nameTa : point.name;
  const displayAddress = language === 'ta' && point.addressTa ? point.addressTa : point.address;

  // Icon setup
  let typeColor = 'from-blue-500 to-indigo-600';
  let typeLabel = t.toilet;
  let typeEmoji = '🚻';

  if (point.type === 'water') {
    typeColor = 'from-cyan-500 to-blue-600';
    typeLabel = t.water;
    typeEmoji = '💧';
  } else if (point.type === 'shade') {
    typeColor = 'from-emerald-500 to-teal-600';
    typeLabel = t.shade;
    typeEmoji = '🌳';
  } else if (point.type === 'ac_rest') {
    typeColor = 'from-purple-500 to-indigo-600';
    typeLabel = t.ac_rest;
    typeEmoji = '❄️';
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-850/80 hover:bg-slate-800/90 border border-slate-750 hover:border-slate-650 transition-all shadow-lg flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r ${typeColor} shadow-sm`}
            >
              {typeEmoji} {typeLabel}
            </span>

            {point.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t.verified}</span>
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{point.avgCleanlinessRating}</span>
            <span className="text-slate-400 font-normal text-[10px]">({point.ratingCount})</span>
          </div>
        </div>

        {/* Title & Address */}
        <h3
          onClick={() => onSelect(point)}
          className="font-extrabold text-sm sm:text-base text-white hover:text-amber-400 cursor-pointer transition-colors leading-snug"
        >
          {displayName}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex items-start gap-1 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
          <span>{displayAddress}</span>
        </p>

        {/* Tags & Features */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap text-[11px]">
          <span
            className={`px-2 py-0.5 rounded-md font-semibold ${
              point.isFree
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
            }`}
          >
            {point.isFree ? t.free : t.paid}
          </span>

          {point.womenFriendly && (
            <span className="px-2 py-0.5 rounded-md font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/20">
              ♀ {t.womenSafe}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{point.openHours}</span>
          </span>

          {point.reportedIssuesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-red-500/15 text-red-400 border border-red-500/20">
              <AlertCircle className="w-3 h-3" />
              <span>
                {point.reportedIssuesCount} {t.complaintCount}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-slate-750/70 flex items-center gap-2">
        <button
          onClick={() => onNavigate(point)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/15 transition-all active:scale-98"
        >
          <Navigation className="w-3.5 h-3.5 text-slate-950" />
          <span>{t.navigateHere}</span>
        </button>

        <button
          onClick={() => onRateReport(point)}
          className="flex items-center gap-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <span>★</span>
          <span>{t.ratePlace}</span>
        </button>
      </div>
    </div>
  );
};
