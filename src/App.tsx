import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import { CarePoint, LiveAlert, RouteOption, TamilNaduCity } from './types';
import { translations } from './i18n/translations';
import { SEED_CARE_POINTS, PRESET_ROUTES } from './data/seedData';
import { Navbar } from './components/Navbar';
import { HeatRiskBanner } from './components/HeatRiskBanner';
import { HeatSafeMap } from './components/Map/HeatSafeMap';
import { RoutePlannerModal } from './components/Routing/RoutePlannerModal';
import { LiveNavigationHUD } from './components/Routing/LiveNavigationHUD';
import { FacilityCard } from './components/Facilities/FacilityCard';
import { FacilityDetailModal } from './components/Facilities/FacilityDetailModal';
import { RateReportModal } from './components/Facilities/RateReportModal';
import { AddCarePointModal } from './components/Facilities/AddCarePointModal';
import { PlannerDashboard } from './components/Dashboard/PlannerDashboard';
import { HydrationRestTimer } from './components/HydrationRestTimer';
import { AuthModal } from './components/Auth/AuthModal';
import { QRShareModal } from './components/QRShareModal';
import {
  Navigation,
  MapPin,
  Search,
  Filter,
  Plus,
  Flame,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Compass,
  TreePine,
  Droplets,
  Wind,
} from 'lucide-react';

function HeatSafeApp() {
  const { language, user } = useAuth();
  const t = translations[language];

  // Core Application State
  const [carePoints, setCarePoints] = useState<CarePoint[]>(SEED_CARE_POINTS);
  const [selectedCity, setSelectedCity] = useState<TamilNaduCity>('chennai');
  const [activeTab, setActiveTab] = useState<'nav' | 'facilities' | 'planner' | 'hydration'>('nav');

  // Routing and Navigation
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(
    PRESET_ROUTES['chn-guindy-tnagar'].heatSafe
  );
  const [competingRoute, setCompetingRoute] = useState<RouteOption | null>(
    PRESET_ROUTES['chn-guindy-tnagar'].fastest
  );
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | undefined>([
    13.0092, 80.2131,
  ]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);
  const [nearbyAlert, setNearbyAlert] = useState<LiveAlert | null>(null);

  // Search & Filters for Facilities Tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('all');

  // Modals
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddPointModalOpen, setIsAddPointModalOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [selectedPointForDetail, setSelectedPointForDetail] = useState<CarePoint | null>(null);
  const [selectedPointForRate, setSelectedPointForRate] = useState<CarePoint | null>(null);

  // Real-time Event Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Fetch initial care points from API
  const fetchCarePoints = useCallback(async () => {
    try {
      const res = await fetch('/api/care-points');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCarePoints(data);
        }
      }
    } catch (e) {
      console.warn('API fallback to seed data', e);
    }
  }, []);

  useEffect(() => {
    fetchCarePoints();
  }, [fetchCarePoints]);

  // Handle City Change
  const handleCityChange = (city: TamilNaduCity) => {
    setSelectedCity(city);
    if (city === 'madurai') {
      setActiveRoute(PRESET_ROUTES['mdu-gori-mattu'].heatSafe);
      setCompetingRoute(PRESET_ROUTES['mdu-gori-mattu'].fastest);
      setCurrentPosition(PRESET_ROUTES['mdu-gori-mattu'].origin);
    } else if (city === 'coimbatore') {
      setActiveRoute(PRESET_ROUTES['cbe-gandhi-rspuram'].heatSafe);
      setCompetingRoute(PRESET_ROUTES['cbe-gandhi-rspuram'].fastest);
      setCurrentPosition(PRESET_ROUTES['cbe-gandhi-rspuram'].origin);
    } else {
      setActiveRoute(PRESET_ROUTES['chn-guindy-tnagar'].heatSafe);
      setCompetingRoute(PRESET_ROUTES['chn-guindy-tnagar'].fastest);
      setCurrentPosition(PRESET_ROUTES['chn-guindy-tnagar'].origin);
    }
    setIsNavigating(false);
    setIsSimulating(false);
    setSimStepIndex(0);
    setNearbyAlert(null);
  };

  // Route Selection from Modal
  const handleRouteSelected = (heatSafe: RouteOption, fastest: RouteOption) => {
    setActiveRoute(heatSafe);
    setCompetingRoute(fastest);
    setIsNavigating(true);
    if (heatSafe.waypoints.length > 0) {
      setCurrentPosition(heatSafe.waypoints[0]);
    }
    setIsSimulating(true);
    setSimStepIndex(0);
  };

  // Start Navigation to Specific Point
  const handleNavigateToPoint = (point: CarePoint) => {
    setSelectedPointForDetail(null);
    setActiveTab('nav');
    setIsNavigating(true);

    const startPos: [number, number] = currentPosition || [point.lat - 0.015, point.lng - 0.015];
    const generatedRoute: RouteOption = {
      id: 'heat_safe',
      name: `Heat-Safe Route to ${point.name}`,
      nameTa: `${point.nameTa || point.name} செல்வதற்கான வெப்ப பாதுகாப்பான பாதை`,
      travelTimeMinutes: 12,
      distanceKm: 3.2,
      heatExposureScore: 25,
      carePointsOnRoute: [point],
      waypoints: [
        startPos,
        [(startPos[0] + point.lat) / 2, (startPos[1] + point.lng) / 2 + 0.002],
        [point.lat, point.lng],
      ],
      highlights: ['Direct heat-safe approach with verified water refill at destination'],
      highlightsTa: ['சேருமிடத்தில் சரிபார்க்கப்பட்ட குடிநீர் வசதியுடன் கூடிய பாதுகாப்பான பாதை'],
      isRecommended: true,
    };

    setActiveRoute(generatedRoute);
    setCompetingRoute(null);
    setCurrentPosition(startPos);
  };

  // Geofence & Proximity Detection
  const checkProximity = useCallback(
    (pos: [number, number]) => {
      const [lat, lng] = pos;
      // Distance calculation in meters
      for (const cp of carePoints) {
        if (cp.city !== selectedCity) continue;
        const dLat = (cp.lat - lat) * 111000;
        const dLng = (cp.lng - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
        const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

        if (dist <= 350) {
          setNearbyAlert({
            id: `alert-${cp.id}`,
            type: 'care_point_nearby',
            title: cp.name,
            titleTa: cp.nameTa || cp.name,
            message: `Free ${cp.type.replace('_', ' ')} available ~${dist}m ahead on left. Rated ★ ${cp.avgCleanlinessRating}`,
            messageTa: `இடதுபுறம் ~${dist}மீ தூரத்தில் ${cp.nameTa || cp.name} உள்ளது. தூய்மை ★ ${cp.avgCleanlinessRating}`,
            carePoint: cp,
            distanceMeters: dist,
            timestamp: new Date().toISOString(),
            severity: 'info',
          });
          return;
        }
      }
    },
    [carePoints, selectedCity]
  );

  // GPS Movement Simulation
  useEffect(() => {
    let timer: any = null;
    if (isSimulating && activeRoute && activeRoute.waypoints.length > 0) {
      timer = setInterval(() => {
        setSimStepIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % activeRoute.waypoints.length;
          const nextPos = activeRoute.waypoints[nextIndex];
          setCurrentPosition(nextPos);
          checkProximity(nextPos);
          return nextIndex;
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, activeRoute, checkProximity]);

  // Handle SSE Realtime Sync Callbacks
  const handleCarePointAdded = useCallback(
    (point: CarePoint) => {
      setCarePoints((prev) => [point, ...prev.filter((p) => p.id !== point.id)]);
      showToast(
        language === 'ta'
          ? `🟢 புதிய பராமரிப்பு மையம் சேர்க்கப்பட்டது: ${point.nameTa || point.name}`
          : `🟢 New Care Point Added: ${point.name}`
      );
    },
    [language, showToast]
  );

  const handleCarePointUpdated = useCallback(
    (point: CarePoint) => {
      setCarePoints((prev) => prev.map((p) => (p.id === point.id ? point : p)));
    },
    []
  );

  const handleRatingAdded = useCallback(
    (rating: any, updatedPoint?: CarePoint) => {
      if (updatedPoint) {
        handleCarePointUpdated(updatedPoint);
      }
      showToast(
        language === 'ta'
          ? `★ புதிய தொழிலாளர் மதிப்பீடு: ${rating.userName} (${rating.userPlatform})`
          : `★ Worker Rating Added: ${rating.userName} (${rating.userPlatform})`
      );
    },
    [handleCarePointUpdated, language, showToast]
  );

  const handleReportAdded = useCallback(
    (report: any, updatedPoint?: CarePoint) => {
      if (updatedPoint) {
        handleCarePointUpdated(updatedPoint);
      }
      showToast(
        language === 'ta'
          ? `⚠️ அவசர புகார் பதிவானது: ${report.issueType.replace('_', ' ')}`
          : `⚠️ Urgent Facility Issue Reported: ${report.issueType.replace('_', ' ')}`
      );
    },
    [handleCarePointUpdated, language, showToast]
  );

  // Filtered Care Points for "Nearby Care Points" Tab
  const filteredCarePoints = carePoints.filter((point) => {
    if (point.city !== selectedCity) return false;
    if (facilityTypeFilter !== 'all' && point.type !== facilityTypeFilter) return false;
    if (user?.womenFriendlyOnly && !point.womenFriendly) return false;
    if (user?.freeOnly && !point.isFree) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        point.name.toLowerCase().includes(q) ||
        (point.nameTa && point.nameTa.toLowerCase().includes(q)) ||
        point.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <RealtimeProvider
      onCarePointAdded={handleCarePointAdded}
      onCarePointUpdated={handleCarePointUpdated}
      onRatingAdded={handleRatingAdded}
      onReportAdded={handleReportAdded}
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenQR={() => setIsQRModalOpen(true)}
          onOpenAddPoint={() => setIsAddPointModalOpen(true)}
        />

        {/* Live Heat Advisory Banner */}
        <HeatRiskBanner onStartBreak={() => setActiveTab('hydration')} />

        {/* Real-time Broadcast Toast */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50 max-w-sm p-3.5 rounded-xl bg-slate-900 border-2 border-emerald-500 shadow-2xl flex items-center gap-3 animate-fadeIn">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
            <p className="text-xs font-bold text-slate-100 leading-tight">{toastMessage}</p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col">
          {/* TAB 1: HEAT-SAFE NAVIGATION */}
          {activeTab === 'nav' && (
            <div className="flex-1 flex flex-col gap-4">
              {/* Quick Actions Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRoutePlannerOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <Navigation className="w-4 h-4 text-slate-950" />
                    <span>{t.planRoute}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('facilities')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-bold transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{t.findNearby}</span>
                  </button>
                </div>

                {/* Active Route Highlights Summary */}
                {activeRoute && (
                  <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
                    <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {language === 'ta' ? activeRoute.nameTa : activeRoute.name}
                    </span>
                    <span className="text-slate-400 hidden md:inline">
                      • {activeRoute.travelTimeMinutes} mins ({activeRoute.distanceKm} km)
                    </span>
                  </div>
                )}
              </div>

              {/* Map & Live Navigation HUD Container */}
              <div className="relative flex-1 min-h-[560px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                {isNavigating && activeRoute && (
                  <LiveNavigationHUD
                    route={activeRoute}
                    currentPosition={currentPosition}
                    onEndNavigation={() => {
                      setIsNavigating(false);
                      setIsSimulating(false);
                      setNearbyAlert(null);
                    }}
                    isSimulating={isSimulating}
                    onToggleSimulate={() => setIsSimulating(!isSimulating)}
                    nearbyAlert={nearbyAlert}
                    onStartCooldown={() => setActiveTab('hydration')}
                  />
                )}

                <HeatSafeMap
                  carePoints={carePoints}
                  selectedCity={selectedCity}
                  onCityChange={handleCityChange}
                  activeRoute={activeRoute}
                  competingRoute={competingRoute}
                  currentPosition={currentPosition}
                  onSelectPoint={(point) => setSelectedPointForDetail(point)}
                  onRateReport={(point) => setSelectedPointForRate(point)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: NEARBY FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              {/* Search & Category Filter Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === 'ta'
                          ? 'கழிப்பறை, மெட்ரோ, RO குடிநீர் நிலையம் அல்லது சாலையை தேடவும்...'
                          : 'Search by facility name, bus stand, metro station or street...'
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Add Point CTA */}
                  <button
                    onClick={() => setIsAddPointModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addPlace}</span>
                  </button>
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  {[
                    { id: 'all', label: t.allTypes },
                    { id: 'toilet', label: t.toilets, icon: '🚻' },
                    { id: 'water', label: t.waters, icon: '💧' },
                    { id: 'shade', label: t.shades, icon: '🌳' },
                    { id: 'ac_rest', label: t.ac_rests, icon: '❄️' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setFacilityTypeFilter(chip.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        facilityTypeFilter === chip.id
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {chip.icon && <span>{chip.icon}</span>}
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facility Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCarePoints.map((point) => (
                  <FacilityCard
                    key={point.id}
                    point={point}
                    onSelect={(p) => setSelectedPointForDetail(p)}
                    onRateReport={(p) => setSelectedPointForRate(p)}
                    onNavigate={(p) => handleNavigateToPoint(p)}
                  />
                ))}
              </div>

              {filteredCarePoints.length === 0 && (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800">
                  <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-300">No care points match your search</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your filters or be the first hero rider to add a missing point!
                  </p>
                  <button
                    onClick={() => setIsAddPointModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400"
                  >
                    + {t.addPlace}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REST & COOLDOWN (HYDRATION TIMER) */}
          {activeTab === 'hydration' && <HydrationRestTimer />}

          {/* TAB 4: CITY PLANNER & HEAT GAPS DASHBOARD */}
          {activeTab === 'planner' && <PlannerDashboard carePoints={carePoints} />}
        </main>

        {/* Global Modals */}
        <RoutePlannerModal
          isOpen={isRoutePlannerOpen}
          onClose={() => setIsRoutePlannerOpen(false)}
          selectedCity={selectedCity}
          onSelectRoute={handleRouteSelected}
        />

        <FacilityDetailModal
          point={selectedPointForDetail}
          isOpen={Boolean(selectedPointForDetail)}
          onClose={() => setSelectedPointForDetail(null)}
          onRateReport={(point) => {
            setSelectedPointForDetail(null);
            setSelectedPointForRate(point);
          }}
          onNavigate={(point) => handleNavigateToPoint(point)}
        />

        <RateReportModal
          point={selectedPointForRate}
          isOpen={Boolean(selectedPointForRate)}
          onClose={() => setSelectedPointForRate(null)}
          onSubmitted={fetchCarePoints}
        />

        <AddCarePointModal
          isOpen={isAddPointModalOpen}
          onClose={() => setIsAddPointModalOpen(false)}
          selectedCity={selectedCity}
          onAdded={fetchCarePoints}
        />

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        <QRShareModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      </div>
    </RealtimeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HeatSafeApp />
    </AuthProvider>
  );
}
