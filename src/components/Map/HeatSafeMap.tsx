import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CarePoint, CarePointType, RouteOption, TamilNaduCity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import {
  MapPin,
  Compass,
  Navigation2,
  Filter,
  Layers,
  Sparkles,
  Shield,
  Droplets,
  TreePine,
  Wind,
} from 'lucide-react';

interface HeatSafeMapProps {
  carePoints: CarePoint[];
  selectedCity: TamilNaduCity;
  onCityChange: (city: TamilNaduCity) => void;
  activeRoute?: RouteOption | null;
  competingRoute?: RouteOption | null;
  currentPosition?: [number, number];
  onSelectPoint: (point: CarePoint) => void;
  onRateReport: (point: CarePoint) => void;
}

const CITY_COORDINATES: Record<TamilNaduCity, { center: [number, number]; zoom: number }> = {
  chennai: { center: [13.0405, 80.2337], zoom: 13 },
  madurai: { center: [9.9287, 78.1393], zoom: 14 },
  coimbatore: { center: [11.0118, 76.9582], zoom: 14 },
  tiruchirappalli: { center: [10.7905, 78.7047], zoom: 13 },
  salem: { center: [11.6643, 78.1460], zoom: 13 },
};

export const HeatSafeMap: React.FC<HeatSafeMapProps> = ({
  carePoints,
  selectedCity,
  onCityChange,
  activeRoute,
  competingRoute,
  currentPosition,
  onSelectPoint,
  onRateReport,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const workerMarkerRef = useRef<L.Marker | null>(null);

  const { language } = useAuth();
  const t = translations[language];

  const [filterType, setFilterType] = useState<string>('all');
  const [filterWomenSafe, setFilterWomenSafe] = useState<boolean>(false);
  const [filterFreeOnly, setFilterFreeOnly] = useState<boolean>(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const cityConfig = CITY_COORDINATES[selectedCity];
      const map = L.map(mapContainerRef.current, {
        center: cityConfig.center,
        zoom: cityConfig.zoom,
        zoomControl: false,
      });

      // Dark styled tile layer using CARTO Dark Matter or OpenStreetMap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when selected city changes
  useEffect(() => {
    if (mapInstanceRef.current && CITY_COORDINATES[selectedCity]) {
      const { center, zoom } = CITY_COORDINATES[selectedCity];
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [selectedCity]);

  // Render Care Point markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = carePoints.filter((point) => {
      if (point.city !== selectedCity) return false;
      if (filterType !== 'all' && point.type !== filterType) return false;
      if (filterWomenSafe && !point.womenFriendly) return false;
      if (filterFreeOnly && !point.isFree) return false;
      return true;
    });

    filtered.forEach((point) => {
      // Color & icon setup
      let bgColor = 'bg-blue-600';
      let borderColor = 'border-blue-400';
      let iconSymbol = '🚻';

      if (point.type === 'toilet') {
        bgColor = 'bg-indigo-600';
        borderColor = 'border-indigo-300';
        iconSymbol = '🚻';
      } else if (point.type === 'water') {
        bgColor = 'bg-cyan-500';
        borderColor = 'border-cyan-300';
        iconSymbol = '💧';
      } else if (point.type === 'shade') {
        bgColor = 'bg-emerald-600';
        borderColor = 'border-emerald-300';
        iconSymbol = '🌳';
      } else if (point.type === 'ac_rest') {
        bgColor = 'bg-purple-600';
        borderColor = 'border-purple-300';
        iconSymbol = '❄️';
      }

      const isVerifiedBadge = point.isVerified
        ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border border-slate-900">✓</span>`
        : '';

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${bgColor} border-2 ${borderColor} shadow-lg shadow-black/40 flex items-center justify-center text-sm font-bold text-white transition-transform hover:scale-125">
            ${iconSymbol}
          </div>
          ${isVerifiedBadge}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });

      const nameToDisplay = language === 'ta' && point.nameTa ? point.nameTa : point.name;
      const popupContent = `
        <div class="p-3 w-64 bg-slate-900 text-slate-100 rounded-xl text-left font-sans">
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              point.type === 'toilet'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : point.type === 'water'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : point.type === 'shade'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }">
              ${point.type.toUpperCase()}
            </span>
            <span class="text-xs font-bold text-amber-400">★ ${point.avgCleanlinessRating}</span>
          </div>

          <h4 class="font-bold text-sm text-white line-clamp-2 leading-tight">${nameToDisplay}</h4>
          <p class="text-[11px] text-slate-400 mt-1 line-clamp-1">${point.address}</p>

          <div class="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
            ${point.isFree ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Free</span>' : '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Nominal Fee</span>'}
            ${point.womenFriendly ? '<span class="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">Women-Safe</span>' : ''}
            <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${point.openHours}</span>
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
            <button id="btn-view-${point.id}" class="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs text-center">
              ${language === 'ta' ? 'விவரம்' : 'Details'}
            </button>
            <button id="btn-rate-${point.id}" class="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700">
              ★ ${language === 'ta' ? 'மதிப்பிடு' : 'Rate'}
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { offset: [0, -10] });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const viewBtn = document.getElementById(`btn-view-${point.id}`);
          const rateBtn = document.getElementById(`btn-rate-${point.id}`);
          if (viewBtn) {
            viewBtn.onclick = () => onSelectPoint(point);
          }
          if (rateBtn) {
            rateBtn.onclick = () => onRateReport(point);
          }
        }, 50);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [carePoints, selectedCity, filterType, filterWomenSafe, filterFreeOnly, language]);

  // Render Routes (Heat-Safe vs Fastest)
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerRef.current) return;

    routesLayerRef.current.clearLayers();

    // Render competing fastest route (if active)
    if (competingRoute && competingRoute.waypoints.length > 1) {
      const fastestPoly = L.polyline(competingRoute.waypoints, {
        color: '#f97316', // Orange warning
        weight: 5,
        opacity: 0.75,
        dashArray: '8, 8',
      });
      routesLayerRef.current.addLayer(fastestPoly);
    }

    // Render Heat-Safe route (primary)
    if (activeRoute && activeRoute.waypoints.length > 1) {
      const heatSafePoly = L.polyline(activeRoute.waypoints, {
        color: '#10b981', // Emerald green
        weight: 6,
        opacity: 0.95,
      });

      routesLayerRef.current.addLayer(heatSafePoly);

      // Origin marker
      const startPoint = activeRoute.waypoints[0];
      const startMarker = L.circleMarker(startPoint, {
        radius: 7,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2,
      }).bindTooltip(language === 'ta' ? 'தொடக்க இடம் (Pickup)' : 'Origin (Pickup)');
      routesLayerRef.current.addLayer(startMarker);

      // Destination marker
      const endPoint = activeRoute.waypoints[activeRoute.waypoints.length - 1];
      const endMarker = L.circleMarker(endPoint, {
        radius: 8,
        fillColor: '#ef4444',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2,
      }).bindTooltip(language === 'ta' ? 'சேருமிடம் (Drop)' : 'Destination (Drop)');
      routesLayerRef.current.addLayer(endMarker);

      // Fit bounds to route
      mapInstanceRef.current.fitBounds(heatSafePoly.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute, competingRoute, language]);

  // Worker GPS / simulated position marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (currentPosition) {
      const [lat, lng] = currentPosition;

      if (!workerMarkerRef.current) {
        const workerHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-bold text-[10px]">
              🛵
            </div>
          </div>
        `;
        const icon = L.divIcon({
          className: 'worker-location-marker',
          html: workerHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        workerMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(
          mapInstanceRef.current
        );
      } else {
        workerMarkerRef.current.setLatLng([lat, lng]);
      }
    } else if (workerMarkerRef.current) {
      workerMarkerRef.current.remove();
      workerMarkerRef.current = null;
    }
  }, [currentPosition]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Map Controls: City Switcher & Filter Chips */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        {/* City Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-750 shadow-xl pointer-events-auto">
          {(['chennai', 'madurai', 'coimbatore'] as TamilNaduCity[]).map((city) => (
            <button
              key={city}
              onClick={() => onCityChange(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedCity === city
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {city === 'chennai' ? (language === 'ta' ? 'சென்னை' : 'Chennai') : null}
              {city === 'madurai' ? (language === 'ta' ? 'மதுரை' : 'Madurai') : null}
              {city === 'coimbatore' ? (language === 'ta' ? 'கோவை' : 'Coimbatore') : null}
            </button>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-750 shadow-xl overflow-x-auto no-scrollbar pointer-events-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.allTypes}
          </button>

          <button
            onClick={() => setFilterType(filterType === 'toilet' ? 'all' : 'toilet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'toilet'
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-400 hover:bg-slate-800'
            }`}
          >
            <span>🚻</span>
            <span>{t.toilets}</span>
          </button>

          <button
            onClick={() => setFilterType(filterType === 'water' ? 'all' : 'water')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'water'
                ? 'bg-cyan-600 text-white'
                : 'text-cyan-400 hover:bg-slate-800'
            }`}
          >
            <span>💧</span>
            <span>{t.waters}</span>
          </button>

          <button
            onClick={() => setFilterType(filterType === 'shade' ? 'all' : 'shade')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'shade'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <span>🌳</span>
            <span>{t.shades}</span>
          </button>

          <button
            onClick={() => setFilterType(filterType === 'ac_rest' ? 'all' : 'ac_rest')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'ac_rest'
                ? 'bg-purple-600 text-white'
                : 'text-purple-400 hover:bg-slate-800'
            }`}
          >
            <span>❄️</span>
            <span>{t.ac_rests}</span>
          </button>

          <button
            onClick={() => setFilterWomenSafe(!filterWomenSafe)}
            className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
              filterWomenSafe
                ? 'bg-pink-600 text-white border-pink-400'
                : 'text-pink-400/80 border-slate-700 hover:bg-slate-800'
            }`}
          >
            ♀ {t.womenSafe}
          </button>
        </div>
      </div>

      {/* Map Legend at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-xl text-xs text-slate-300 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px]">🚻</div>
          <span>{t.toilet}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-[9px]">💧</div>
          <span>{t.water}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px]">🌳</div>
          <span>{t.shade}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-purple-600 flex items-center justify-center text-[9px]">❄️</div>
          <span>{t.ac_rest}</span>
        </div>
      </div>

      {/* The actual Leaflet DOM element */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />
    </div>
  );
};
