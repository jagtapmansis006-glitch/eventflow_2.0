import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Search,
  Layers,
  MapPin,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Eye,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { Zone, Gate, TransportHub, Hotel } from '../types';
import { MAP_CENTER } from '../data/mockData';

interface InteractiveMapProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  hotels: Hotel[];
  selectedZoneId: string | null;
  onSelectZone: (zone: Zone) => void;
  onSelectGate?: (gate: Gate) => void;
  onSelectTransport?: (transport: TransportHub) => void;
  onSelectHotel?: (hotel: Hotel) => void;
  onSimulateAction?: (zone: Zone) => void;
  isFullScreenMobile?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  zones,
  gates,
  transports,
  hotels,
  selectedZoneId,
  onSelectZone,
  onSelectGate,
  onSelectTransport,
  onSelectHotel,
  onSimulateAction,
  isFullScreenMobile = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const crowdFlowLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const [useDigitalTwinFallback, setUseDigitalTwinFallback] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'zones' | 'gates' | 'transit'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (useDigitalTwinFallback) return;

    // Prevent double initialization
    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [MAP_CENTER.lat, MAP_CENTER.lng],
          zoom: MAP_CENTER.zoom,
          zoomControl: false, // We render custom touch-friendly controls
          attributionControl: true,
          fadeAnimation: true,
        });

        // OpenStreetMap Dark/Voyager or CartoDB Dark style tiles for a clean, sleek command center feel
        // CartoDB Dark Matter tiles are free, ultra-reliable, require no API key, and look incredible for dark UI
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
          minZoom: 13,
        });

        tileLayer.on('tileerror', () => {
          console.warn('Leaflet tile load warning: falling back or retrying');
        });

        tileLayer.addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerGroupRef.current = markersLayer;

        const crowdLayer = L.layerGroup().addTo(map);
        crowdFlowLayerRef.current = crowdLayer;

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Crucial Leaflet fix: handle container resize / visibility changes
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
        setMapError(true);
        setUseDigitalTwinFallback(true);
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [useDigitalTwinFallback]);

  // When container size changes or tab becomes active, invalidate size
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullScreenMobile]);

  // Draw crowd flow paths and update interactive markers whenever data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || useDigitalTwinFallback) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerGroupRef.current;
    markersLayer.clearLayers();

    // 1. Draw animated crowd flow paths
    if (crowdFlowLayerRef.current) {
      crowdFlowLayerRef.current.clearLayers();

      // Flow 1: Central Station -> Main Arena (Heavy influx)
      const stationToArena = [
        [19.0632, 72.8640],
        [19.0645, 72.8655],
        [19.0658, 72.8670],
        [19.0665, 72.8680],
      ] as L.LatLngExpression[];

      // Flow 2: East Gate -> Main Arena
      const eastToArena = [
        [19.0678, 72.8725],
        [19.0672, 72.8700],
        [19.0665, 72.8680],
      ] as L.LatLngExpression[];

      // Flow 3: Reroute Flow from Concourse to Gate 3 (Alternate recommendation path)
      const rerouteToGate3 = [
        [19.0665, 72.8680],
        [19.0655, 72.8688],
        [19.0650, 72.8698],
      ] as L.LatLngExpression[];

      // Primary congested corridor (Red dashed animated line)
      L.polyline(stationToArena, {
        color: '#ef4444',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        className: 'animate-flow-dash',
      }).addTo(crowdFlowLayerRef.current);

      // East gate normal inflow (Amber dashed)
      L.polyline(eastToArena, {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 6',
        className: 'animate-flow-dash',
      }).addTo(crowdFlowLayerRef.current);

      // AI suggested diversion bypass (Emerald dashed)
      L.polyline(rerouteToGate3, {
        color: '#10b981',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 6',
        className: 'animate-flow-dash',
      }).addTo(crowdFlowLayerRef.current);
    }

    // 2. Render Zone Markers
    if (activeFilter === 'all' || activeFilter === 'zones') {
      zones.forEach((zone) => {
        const isSelected = selectedZoneId === zone.id;
        const isCritical = zone.pressure >= 80 || zone.status === 'CRITICAL';
        const isWarning = zone.pressure >= 60 && zone.pressure < 80;

        const colorBg = isCritical
          ? 'bg-rose-600'
          : isWarning
          ? 'bg-amber-500'
          : 'bg-emerald-500';

        const borderColor = isSelected
          ? 'border-white ring-4 ring-cyan-400'
          : isCritical
          ? 'border-rose-400'
          : 'border-slate-300';

        const pulseClass = isCritical ? 'animate-critical-pulse' : '';

        // Distinct, large, readable marker: 🔴 A 78% (min 48px touch target!)
        const iconHtml = `
          <div id="marker-${zone.id}" class="relative flex flex-col items-center justify-center cursor-pointer select-none group" style="width: 58px; height: 58px;">
            <div class="w-13 h-13 rounded-2xl ${colorBg} ${borderColor} ${pulseClass} border-2 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.6)] text-white font-bold transition-transform group-hover:scale-110 active:scale-95">
              <span class="text-xs uppercase tracking-wider font-extrabold leading-none">${zone.code}</span>
              <span class="text-[13px] font-black leading-tight mt-0.5">${zone.pressure}%</span>
            </div>
            <div class="absolute -bottom-4 px-1.5 py-0.5 bg-slate-900/90 text-[10px] font-medium text-slate-200 rounded border border-slate-700 whitespace-nowrap shadow-sm pointer-events-none">
              ${zone.name.split('—')[1]?.trim() || zone.name}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-zone-marker',
          iconSize: [58, 58],
          iconAnchor: [29, 29],
        });

        const marker = L.marker([zone.latitude, zone.longitude], { icon: customIcon });

        marker.on('click', () => {
          onSelectZone(zone);
          map.setView([zone.latitude, zone.longitude], Math.max(map.getZoom(), 16), {
            animate: true,
          });
        });

        marker.addTo(markersLayer);
      });
    }

    // 3. Render Gate Markers
    if (activeFilter === 'all' || activeFilter === 'gates') {
      gates.forEach((gate) => {
        const isCongested = gate.capacity >= 80;
        const gateColor = isCongested
          ? 'bg-rose-500'
          : gate.capacity >= 60
          ? 'bg-amber-500'
          : 'bg-teal-500';

        const gateHtml = `
          <div id="marker-gate-${gate.id}" class="flex items-center gap-1 px-2 py-1 bg-slate-900/95 border border-slate-700 rounded-lg shadow-md text-white text-[11px] font-semibold cursor-pointer active:scale-95">
            <span class="w-2 h-2 rounded-full ${gateColor}"></span>
            <span>${gate.name.split('(')[0].trim()}</span>
            <span class="text-slate-400 font-mono text-[10px] ml-0.5">${gate.queueMin}m</span>
          </div>
        `;

        const gateIcon = L.divIcon({
          html: gateHtml,
          className: 'custom-gate-marker',
          iconSize: [90, 26],
          iconAnchor: [45, 13],
        });

        const marker = L.marker([gate.latitude, gate.longitude], { icon: gateIcon });
        marker.on('click', () => {
          if (onSelectGate) onSelectGate(gate);
        });
        marker.addTo(markersLayer);
      });
    }

    // 4. Render Transport Hubs (Station, Shuttles)
    if (activeFilter === 'all' || activeFilter === 'transit') {
      transports.forEach((hub) => {
        const isStation = hub.type === 'station';
        const hubHtml = `
          <div id="marker-hub-${hub.id}" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/95 border border-indigo-700/80 rounded-xl shadow-lg text-white text-xs font-bold cursor-pointer active:scale-95">
            <span class="text-base">${isStation ? '🚉' : '🚌'}</span>
            <div class="flex flex-col text-left">
              <span class="leading-none text-[11px]">${hub.name.split('BKC')[0].trim()}</span>
              <span class="text-[10px] font-mono text-amber-400 font-semibold leading-tight">${hub.loadPercentage}% Load</span>
            </div>
          </div>
        `;

        const hubIcon = L.divIcon({
          html: hubHtml,
          className: 'custom-hub-marker',
          iconSize: [110, 34],
          iconAnchor: [55, 17],
        });

        const marker = L.marker([hub.latitude, hub.longitude], { icon: hubIcon });
        marker.on('click', () => {
          if (onSelectTransport) onSelectTransport(hub);
        });
        marker.addTo(markersLayer);
      });

      // 5. Render Hotels
      hotels.forEach((hotel) => {
        const hotelHtml = `
          <div id="marker-hotel-${hotel.id}" class="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/90 border border-emerald-700/70 rounded-lg shadow-md text-emerald-200 text-[11px] font-medium cursor-pointer active:scale-95">
            <span>🏨</span>
            <div class="flex flex-col">
              <span class="leading-none">${hotel.name.split('&')[0].trim()}</span>
              <span class="text-[9px] text-emerald-400 font-mono">${hotel.vacancyRate}% Vacant</span>
            </div>
          </div>
        `;

        const hotelIcon = L.divIcon({
          html: hotelHtml,
          className: 'custom-hotel-marker',
          iconSize: [100, 28],
          iconAnchor: [50, 14],
        });

        const marker = L.marker([hotel.latitude, hotel.longitude], { icon: hotelIcon });
        marker.on('click', () => {
          if (onSelectHotel) onSelectHotel(hotel);
        });
        marker.addTo(markersLayer);
      });
    }

    // 6. User Location Marker if active
    if (userLocation) {
      const locHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-4 h-4 bg-cyan-500 border-2 border-white rounded-full shadow-[0_0_12px_rgba(6,182,212,1)]"></div>
          <div class="absolute w-8 h-8 bg-cyan-400/30 rounded-full animate-ping"></div>
        </div>
      `;
      const locIcon = L.divIcon({
        html: locHtml,
        className: 'user-loc-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: locIcon }).addTo(markersLayer);
    }
  }, [zones, gates, transports, hotels, selectedZoneId, activeFilter, userLocation, useDigitalTwinFallback]);

  // Zoom and Map Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([MAP_CENTER.lat, MAP_CENTER.lng], MAP_CENTER.zoom, {
        animate: true,
      });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If in real life location is far, we keep centered in festival campus with simulated operator marker
          const coords = { lat: 19.0662, lng: 72.8668 };
          setUserLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
          }
        },
        () => {
          // Fallback simulation
          const coords = { lat: 19.0662, lng: 72.8668 };
          setUserLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
          }
        },
        { timeout: 3000 }
      );
    } else {
      const coords = { lat: 19.0662, lng: 72.8668 };
      setUserLocation(coords);
    }
  };

  // Search logic
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    const matchedZone = zones.find(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.code.toLowerCase() === q ||
        `zone ${z.code.toLowerCase()}`.includes(q)
    );

    if (matchedZone) {
      onSelectZone(matchedZone);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([matchedZone.latitude, matchedZone.longitude], 16, {
          animate: true,
        });
      }
      return;
    }

    const matchedGate = gates.find((g) => g.name.toLowerCase().includes(q));
    if (matchedGate && mapInstanceRef.current) {
      mapInstanceRef.current.setView([matchedGate.latitude, matchedGate.longitude], 16, {
        animate: true,
      });
      if (onSelectGate) onSelectGate(matchedGate);
      return;
    }

    const matchedTransport = transports.find((t) => t.name.toLowerCase().includes(q));
    if (matchedTransport && mapInstanceRef.current) {
      mapInstanceRef.current.setView([matchedTransport.latitude, matchedTransport.longitude], 16, {
        animate: true,
      });
      if (onSelectTransport) onSelectTransport(matchedTransport);
    }
  };

  // Currently highlighted zone for the bottom preview card
  const highlightedZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) || zones[0];
  }, [zones, selectedZoneId]);

  return (
    <div
      id="interactive-map-wrapper"
      className="relative w-full flex flex-col bg-[#0a0a0c] overflow-hidden"
      style={{
        height: isFullScreenMobile ? 'calc(100dvh - 124px)' : '100%',
        minHeight: isFullScreenMobile ? '520px' : '440px',
      }}
    >
      {/* Top Search & Filter Bar with Frosted Glass Theme */}
      <div className="absolute top-3 left-3 right-16 z-20 flex flex-col gap-2 pointer-events-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl">
          <Search className="absolute left-3 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search zone, gate, station..."
            className="w-full bg-black/60 backdrop-blur-xl text-sm text-white placeholder-white/40 pl-9 pr-8 py-2.5 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-xs text-white/40 hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </form>

        {/* Quick layer filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['all', 'zones', 'gates', 'transit'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition active:scale-95 whitespace-nowrap shadow-md border ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white border-blue-500/50 shadow-blue-600/30'
                  : 'bg-black/60 backdrop-blur-xl text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              {filter === 'all' ? 'All Points' : filter}
            </button>
          ))}

          {/* Offline / Digital Twin Toggle button */}
          <button
            onClick={() => setUseDigitalTwinFallback((prev) => !prev)}
            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-xl flex items-center gap-1.5 border transition shadow-md backdrop-blur-xl ${
              useDigitalTwinFallback
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                : 'bg-black/60 text-white/60 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle between Satellite/Vector tiles and SVG Digital Twin"
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] tracking-wider uppercase font-semibold">
              {useDigitalTwinFallback ? 'Digital Twin' : 'Dark Tiles'}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Map Controls in Upper-Right: Frosted glass buttons */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          id="map-zoom-in-btn"
          onClick={handleZoomIn}
          className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-xl hover:bg-white/10 text-white/80 border border-white/10 shadow-2xl flex items-center justify-center active:scale-90 transition min-w-[44px] min-h-[44px]"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          id="map-zoom-out-btn"
          onClick={handleZoomOut}
          className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-xl hover:bg-white/10 text-white/80 border border-white/10 shadow-2xl flex items-center justify-center active:scale-90 transition min-w-[44px] min-h-[44px]"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          id="map-reset-center-btn"
          onClick={handleResetCenter}
          className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-xl hover:bg-white/10 text-blue-400 border border-white/10 shadow-2xl flex items-center justify-center active:scale-90 transition min-w-[44px] min-h-[44px]"
          title="Reset map view to event center"
          aria-label="Reset to festival center"
        >
          <Crosshair className="w-5 h-5" />
        </button>
        <button
          id="map-locate-me-btn"
          onClick={handleLocateMe}
          className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-xl hover:bg-white/10 text-emerald-400 border border-white/10 shadow-2xl flex items-center justify-center active:scale-90 transition min-w-[44px] min-h-[44px]"
          title="Locate operator / current campus position"
          aria-label="My location"
        >
          <Navigation className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Main Map Container: Leaflet instance OR Digital Twin Vector Fallback */}
      {!useDigitalTwinFallback ? (
        <div className="relative w-full h-full flex-1">
          <div
            ref={mapContainerRef}
            id="leaflet-map-canvas"
            className="w-full h-full z-10"
            style={{ minHeight: '400px', height: '100%', width: '100%' }}
          />

          {/* Loading state indicator */}
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 z-30 bg-[#0d1322] flex flex-col items-center justify-center text-slate-300 p-4">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-sm font-semibold">Loading destination map...</p>
              <p className="text-xs text-slate-500 mt-1">Connecting to EventFlow digital twin</p>
            </div>
          )}

          {/* Error fallback state */}
          {mapError && (
            <div className="absolute inset-0 z-30 bg-[#0d1322] flex flex-col items-center justify-center text-slate-300 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Map tiles unavailable</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                EventFlow Digital Twin is still fully operational with real-time zone telemetry and flow modeling.
              </p>
              <button
                onClick={() => setUseDigitalTwinFallback(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg transition active:scale-95"
              >
                [ USE DIGITAL TWIN ]
              </button>
            </div>
          )}
        </div>
      ) : (
        /* EventFlow Digital Twin: Stylized offline SVG / Vector Campus Map (Fallback) */
        <div className="relative w-full h-full flex-1 bg-gradient-to-b from-[#080d1a] to-[#0d1527] flex flex-col items-center justify-center p-2 select-none">
          <div className="absolute top-16 left-4 text-left">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Offline Digital Twin Mode
            </span>
          </div>

          <svg
            className="w-full h-full max-w-lg max-h-[500px]"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Campus boundary & grounds */}
            <rect x="20" y="20" width="360" height="360" rx="28" fill="#0d1424" stroke="#1e293b" strokeWidth="2" />
            <path d="M40 180 Q 200 120 360 160" stroke="#334155" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
            <path d="M180 40 Q 210 200 220 360" stroke="#334155" strokeWidth="12" strokeLinecap="round" opacity="0.4" />

            {/* Crowd Flow Lines */}
            <path
              d="M120 310 L 190 200 L 210 140"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="animate-flow-dash"
            />
            <path
              d="M310 150 L 240 140"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeDasharray="5 5"
              className="animate-flow-dash"
            />
            <path
              d="M210 140 L 260 210"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              className="animate-flow-dash"
            />

            {/* Zone A: Main Arena */}
            <g
              id="svg-zone-a"
              className="cursor-pointer"
              onClick={() => onSelectZone(zones[0])}
            >
              <circle cx="210" cy="135" r="36" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
              <circle cx="210" cy="135" r="26" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              <text x="210" y="132" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
                A
              </text>
              <text x="210" y="145" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                {zones[0]?.pressure || 78}%
              </text>
              <text x="210" y="172" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">
                Main Arena
              </text>
            </g>

            {/* Zone B: Central Station */}
            <g
              id="svg-zone-b"
              className="cursor-pointer"
              onClick={() => onSelectZone(zones[1])}
            >
              <rect x="80" y="290" width="80" height="34" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
              <text x="120" y="306" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                🚉 Station B
              </text>
              <text x="120" y="318" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                {zones[1]?.pressure || 91}% Load
              </text>
            </g>

            {/* Zone C: East Gate */}
            <g
              id="svg-zone-c"
              className="cursor-pointer"
              onClick={() => onSelectZone(zones[2])}
            >
              <circle cx="310" cy="145" r="20" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x="310" y="142" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                C
              </text>
              <text x="310" y="153" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                {zones[2]?.pressure || 64}%
              </text>
            </g>

            {/* Zone D: West Gate */}
            <g
              id="svg-zone-d"
              className="cursor-pointer"
              onClick={() => onSelectZone(zones[3])}
            >
              <circle cx="90" cy="160" r="18" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <text x="90" y="157" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                D
              </text>
              <text x="90" y="167" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                {zones[3]?.pressure || 52}%
              </text>
            </g>

            {/* Zone E: Hotels */}
            <g
              id="svg-zone-e"
              className="cursor-pointer"
              onClick={() => onSelectZone(zones[4])}
            >
              <rect x="180" y="42" width="70" height="28" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
              <text x="215" y="58" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">
                🏨 Hotels (18%)
              </text>
            </g>

            {/* Gate 3 Alternate Route */}
            <g
              id="svg-gate-3"
              className="cursor-pointer"
              onClick={() => onSelectZone(zones[0])}
            >
              <rect x="250" y="215" width="70" height="24" rx="6" fill="#047857" stroke="#34d399" strokeWidth="1" />
              <text x="285" y="231" fill="#ecfdf5" fontSize="9" fontWeight="bold" textAnchor="middle">
                Gate 3 (8m Q)
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* Floating Bottom Zone Summary Card (if not opening bottom sheet yet) */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto">
        <div
          id="map-bottom-quick-bar"
          className="bg-black/60 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between transition active:scale-[0.99]"
          onClick={() => onSelectZone(highlightedZone)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg border border-white/10 ${
                highlightedZone.pressure >= 80
                  ? 'bg-red-600 shadow-red-600/40 ring-2 ring-red-500/30'
                  : highlightedZone.pressure >= 60
                  ? 'bg-amber-500 shadow-amber-500/30'
                  : 'bg-emerald-500 shadow-emerald-500/30'
              }`}
            >
              {highlightedZone.code}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{highlightedZone.name.split('—')[0]}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    highlightedZone.pressure >= 80
                      ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {highlightedZone.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                <span className="font-mono font-bold text-white">{highlightedZone.pressure}%</span>
                <span className="text-white/30">→</span>
                <span className="font-mono font-bold text-red-400">{highlightedZone.projectedPressure}%</span>
                <span className="text-white/40 text-[11px]">• {highlightedZone.criticalInMinutes}m to critical</span>
              </div>
            </div>
          </div>

          <button
            id="map-view-intelligence-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelectZone(highlightedZone);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-1.5 whitespace-nowrap min-h-[42px]"
          >
            <span>VIEW ZONE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
