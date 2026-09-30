import React, { useState, useEffect } from 'react';
import { CarePoint, FacilityReport, UserRating } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import {
  X,
  Star,
  Shield,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface FacilityDetailModalProps {
  point: CarePoint | null;
  isOpen: boolean;
  onClose: () => void;
  onRateReport: (point: CarePoint) => void;
  onNavigate: (point: CarePoint) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  point,
  isOpen,
  onClose,
  onRateReport,
  onNavigate,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [reports, setReports] = useState<FacilityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (point && isOpen) {
      setLoading(true);
      Promise.all([
        fetch(`/api/ratings?carePointId=${point.id}`).then((r) => r.json()),
        fetch(`/api/reports?carePointId=${point.id}`).then((r) => r.json()),
      ])
        .then(([rts, reps]) => {
          setRatings(Array.isArray(rts) ? rts : []);
          setReports(Array.isArray(reps) ? reps : []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [point, isOpen]);

  if (!isOpen || !point) return null;

  const displayName = language === 'ta' && point.nameTa ? point.nameTa : point.name;
  const displayAddress = language === 'ta' && point.addressTa ? point.addressTa : point.address;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {point.type === 'toilet' ? '🚻' : point.type === 'water' ? '💧' : point.type === 'shade' ? '🌳' : '❄️'}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              {point.type.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white">{displayName}</h2>
              {point.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.verified}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
              <span>{displayAddress}</span>
            </p>
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{t.cleanliness}</span>
                <span className="text-lg font-black text-amber-400">★ {point.avgCleanlinessRating} / 5</span>
              </div>
              <Star className="w-5 h-5 text-amber-400 fill-current" />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{t.safety}</span>
                <span className="text-lg font-black text-emerald-400">★ {point.avgSafetyRating} / 5</span>
              </div>
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Key tags & properties */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Access Policy:</span>
              <span className="font-bold text-slate-200">{point.isFree ? t.free : t.paid}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Operating Hours:</span>
              <span className="font-bold text-slate-200">{point.openHours}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Women-Safe Score:</span>
              <span className="font-bold text-pink-300">{point.womenFriendly ? 'Verified Women-Friendly' : 'General Public'}</span>
            </div>
          </div>

          {/* Worker Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Worker Reviews & Field Reports ({ratings.length})</span>
              </h4>
              <button
                onClick={() => onRateReport(point)}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                + Add Review
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500 py-3 text-center">Loading live field updates...</p>
            ) : ratings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-750 text-center">
                <p className="text-xs text-slate-400">No worker reviews yet. Be the first to rate this point!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ratings.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-white">
                        {r.userName} <span className="text-[10px] text-amber-400 font-normal">({r.userPlatform})</span>
                      </span>
                      <span className="text-amber-400 font-bold">★ {r.cleanlinessRating}</span>
                    </div>
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 my-1.5">
                        {r.tags.map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {r.comment && <p className="text-slate-300 mt-1 leading-relaxed">{r.comment}</p>}
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center gap-2">
          <button
            onClick={() => onNavigate(point)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-98"
          >
            <Navigation className="w-4 h-4 text-slate-950" />
            <span>{t.navigateHere}</span>
          </button>
          <button
            onClick={() => onRateReport(point)}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            ★ {t.ratePlace}
          </button>
        </div>
      </div>
    </div>
  );
};
