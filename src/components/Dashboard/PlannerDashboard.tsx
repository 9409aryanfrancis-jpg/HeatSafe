import React, { useState, useEffect } from 'react';
import { CarePoint, CitySummaryStats, TamilNaduCity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import {
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Droplets,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  Globe2,
} from 'lucide-react';

interface PlannerDashboardProps {
  carePoints: CarePoint[];
}

export const PlannerDashboard: React.FC<PlannerDashboardProps> = ({ carePoints }) => {
  const { language } = useAuth();
  const t = translations[language];

  const [statsData, setStatsData] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<TamilNaduCity>('chennai');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [carePoints]);

  const downloadDataset = (format: 'csv' | 'geojson') => {
    window.location.href = `/api/export?format=${format}`;
  };

  const currentCityStats: CitySummaryStats | undefined = statsData?.cityBreakdown?.find(
    (c: CitySummaryStats) => c.city === selectedCity
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>State Planning Commission & Gig Platform Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t.dashboardTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {t.dashboardDesc}
          </p>
        </div>

        {/* Export Data Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadDataset('csv')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.downloadCSV}</span>
          </button>

          <button
            onClick={() => downloadDataset('geojson')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
          >
            <Globe2 className="w-4 h-4" />
            <span>{t.downloadGeoJSON}</span>
          </button>
        </div>
      </div>

      {/* Aggregate High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.statsTotalPoints}</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {statsData?.totalPoints || carePoints.length}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
            Across 5 TN Cities
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.statsCleanScore}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">4.5 ★</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {statsData?.totalRatings || 18} worker ratings
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.statsActiveIssues}</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">
            {statsData?.totalReports || 1}
          </div>
          <span className="text-[11px] text-red-300 font-semibold mt-1 inline-block">
            Flagged for GCC repair
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-750 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.statsCareDeserts}</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">9 Zones</div>
          <span className="text-[11px] text-purple-300 font-semibold mt-1 inline-block">
            Needs Urgent Kiosks
          </span>
        </div>
      </div>

      {/* City Breakdown & Care Desert Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Filter & Detailed Metrics */}
        <div className="p-5 rounded-2xl bg-slate-850/80 border border-slate-750 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              {t.filterByCity}
            </h3>
            <div className="flex items-center gap-1">
              {(['chennai', 'madurai', 'coimbatore'] as TamilNaduCity[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    selectedCity === c
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {currentCityStats && (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-300">Clean Toilets</span>
                <span className="font-black text-sm text-indigo-400">
                  {currentCityStats.toiletsCount} Verified
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-300">Cold Drinking Water Refills</span>
                <span className="font-black text-sm text-cyan-400">
                  {currentCityStats.waterPointsCount} Points
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-300">AC Lounges / Metro Rest</span>
                <span className="font-black text-sm text-purple-400">
                  {currentCityStats.acRestCount} Spaces
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-300">Dense Tree Shaded Corridors</span>
                <span className="font-black text-sm text-emerald-400">
                  {currentCityStats.shadePointsCount} Zones
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Identified Care Deserts (Advocacy & Action Map) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-850/80 border border-slate-750 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Urgent Care Deserts in {selectedCity.toUpperCase()}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Delivery corridors with &gt; 2,000 daily gig trips but 0 accessible clean toilets or water within 1 km:
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {selectedCity === 'chennai' ? (
              <>
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-red-200">
                      1. OMR Toll Plaza to Thoraipakkam Flyover (6.2 km)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Heavy Swiggy/Zomato parcel volume. Asphalt temperatures reach 48°C. Recommendation: Request GCC to open 2 Amma Kudineer kiosks at Karapakkam & Sholinganallur.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 shrink-0">
                    High Vulnerability
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-amber-200">
                      2. Koyambedu Wholesale Market Perimeter to 100 Feet Road
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Auto and delivery riders report existing pay-to-use toilets are locked or dirty. Recommendation: Modernize sanitation block with 24/7 worker access.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 shrink-0">
                    Maintenance Gap
                  </span>
                </div>
              </>
            ) : selectedCity === 'madurai' ? (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-red-200">
                    1. Melur Main Road Delivery Belt (Madurai East)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No verified clean washrooms between Agricultural College and Othakadai. Heavy heat exposure during afternoon deliveries.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 shrink-0">
                  Critical Gap
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-red-200">
                    1. Avinashi Road IT Park Belt (Coimbatore Peelamedu to SITRA)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    High quick-commerce activity (Zepto, Blinkit). Riders need roadside shaded shelters and cold water refill points.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 shrink-0">
                  Action Required
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
