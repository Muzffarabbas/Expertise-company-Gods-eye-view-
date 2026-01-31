
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  Activity, 
  Box, 
  AlertTriangle, 
  Map as MapIcon, 
  Cpu, 
  Crosshair, 
  Truck,
  TrendingUp,
  LayoutDashboard,
  Zap,
  Globe
} from 'lucide-react';
import { Asset, AssetStatus, ActivityEvent } from './types';
import { KSA_BOUNDS, INITIAL_ASSET_COUNT, REVENUE_RATE_PER_HOUR, MOCK_PROJECTS, REGIONS, PROJECT_SITES, FAILURE_TYPES } from './constants';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HealthCard from './components/HealthCard';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);

  // Initialize Assets with Localized Project Sites (Balanced Distribution)
  useEffect(() => {
    const initialAssets: Asset[] = Array.from({ length: INITIAL_ASSET_COUNT }).map((_, i) => {
      const site = PROJECT_SITES[i % PROJECT_SITES.length];
      const statusSeed = Math.random();
      let status = AssetStatus.ACTIVE;
      
      if (statusSeed > 0.96) status = AssetStatus.BREAKDOWN;
      else if (statusSeed > 0.94) status = AssetStatus.GHOST;
      else if (statusSeed > 0.82) status = AssetStatus.IDLE;
      
      // Adjusted jitter for a "distributed but focused" look (0.35 deg spread)
      const jitterLat = (Math.random() - 0.5) * 0.35;
      const jitterLng = (Math.random() - 0.5) * 0.35;

      return {
        id: `CRN-${1000 + i}`,
        type: 'CRANE',
        model: i % 3 === 0 ? 'Liebherr LTM 1500' : i % 2 === 0 ? 'Terex AC 1000' : 'Sany SAC6000',
        status: status,
        coordinates: [
          site.coords[0] + jitterLat,
          site.coords[1] + jitterLng,
        ],
        lastLoad: Date.now() - Math.random() * 86400000,
        stressScore: status === AssetStatus.BREAKDOWN ? 92 + Math.random() * 8 : Math.floor(Math.random() * 75),
        tonnage: [250, 500, 1000][Math.floor(Math.random() * 3)],
        assignedProject: site.name,
        siteName: site.name,
        clientCompany: site.client,
        assignedJob: site.job,
        lmiValue: status === AssetStatus.IDLE ? Math.random() * 8 : 45 + Math.random() * 55,
        idleTimeMinutes: status === AssetStatus.IDLE ? Math.floor(Math.random() * 400) : 0,
        regionId: site.regionId
      };
    });
    setAssets(initialAssets);
  }, []);

  // Live Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const statusChange = Math.random() > 0.998;
        let newStatus = asset.status;
        
        if (statusChange) {
          const rand = Math.random();
          if (rand > 0.75) newStatus = AssetStatus.BREAKDOWN;
          else if (rand > 0.5) newStatus = AssetStatus.IDLE;
          else if (rand > 0.1) newStatus = AssetStatus.ACTIVE;
          else newStatus = AssetStatus.GHOST;
        }

        const latDrift = (Math.random() - 0.5) * 0.00015;
        const lngDrift = (Math.random() - 0.5) * 0.00015;

        return {
          ...asset,
          status: newStatus,
          coordinates: [asset.coordinates[0] + latDrift, asset.coordinates[1] + lngDrift],
          lmiValue: Math.max(0, Math.min(100, asset.lmiValue + (Math.random() - 0.5) * 2)),
          stressScore: Math.max(0, Math.min(100, asset.stressScore + (Math.random() - 0.5) * 1)),
          idleTimeMinutes: newStatus === AssetStatus.IDLE ? asset.idleTimeMinutes + 2 : 0
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Wildly Important Logic: Focus on DAMAGED and NON-WORKING assets
  useEffect(() => {
    const interval = setInterval(() => {
      // Prioritize BREAKDOWN status for the WIG feed
      const criticalAssets = assets
        .filter(a => a.status === AssetStatus.BREAKDOWN || a.status === AssetStatus.GHOST || a.stressScore > 88)
        .sort((a, b) => (a.status === AssetStatus.BREAKDOWN ? -1 : 1))
        .slice(0, 15);

      if (criticalAssets.length === 0) return;
      
      const target = criticalAssets[Math.floor(Math.random() * criticalAssets.length)];
      
      let type: ActivityEvent['type'] = 'MAINTENANCE_ALERT';
      let message = '';

      if (target.status === AssetStatus.BREAKDOWN) {
        const failure = FAILURE_TYPES[Math.floor(Math.random() * FAILURE_TYPES.length)];
        type = 'MAINTENANCE_ALERT';
        message = `CRITICAL DAMAGE: ${target.id} at ${target.siteName} is DOWN. Reported: ${failure}. Engine/Hydraulic lock engaged.`;
      } else if (target.status === AssetStatus.GHOST) {
        type = 'GHOST_DETECTED';
        message = `GHOST DETECTION: ${target.id} moving without assignment at ${target.siteName}. External entity suspected.`;
      } else if (target.stressScore > 88) {
        type = 'MAINTENANCE_ALERT';
        message = `STRUCTURAL RISK: ${target.id} at ${target.siteName} reporting ${target.stressScore.toFixed(1)}% tension. Metal fatigue likely.`;
      } else {
        type = 'IDLE_START';
        message = `IDLE LOSS: ${target.id} at ${target.siteName} non-productive for 3h+. Asset cost: ${Math.abs(REVENUE_RATE_PER_HOUR[AssetStatus.IDLE])} SAR/H.`;
      }

      const newEvent: ActivityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        assetId: target.id,
        timestamp: new Date(),
        type,
        message
      };

      setActivities(prev => [newEvent, ...prev].slice(0, 30));
    }, 3000);

    return () => clearInterval(interval);
  }, [assets]);

  const totalIdleCost = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (REVENUE_RATE_PER_HOUR[curr.status] < 0 ? Math.abs(REVENUE_RATE_PER_HOUR[curr.status]) : 0), 0);
  }, [assets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = assets.find(a => a.id.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found) {
      setSelectedRegionId(found.regionId);
      setSelectedAssetId(found.id);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-inter text-sm">
      <div className="scanline"></div>
      
      {/* Sidebar Navigation */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/80 backdrop-blur-md z-40">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tighter text-white leading-tight uppercase">EXPERTISE CO.</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mono">God's Eye View</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => { setSelectedRegionId(null); setSelectedAssetId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${!selectedRegionId ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <Globe size={18} />
            <span className="font-semibold text-sm">National Matrix</span>
          </button>
          
          <div className="pt-4 px-2 pb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mono">Project Regions</span>
          </div>
          {REGIONS.map(region => (
            <button 
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${selectedRegionId === region.id ? 'bg-slate-800 text-emerald-400' : 'hover:bg-slate-900/50 text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedRegionId === region.id ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-700'}`} />
                <span className="font-semibold text-xs tracking-wide">{region.name}</span>
              </div>
              <span className="text-[10px] mono text-slate-600 font-bold">
                {assets.filter(a => a.regionId === region.id).length}
              </span>
            </button>
          ))}
        </nav>

        {/* Live Feedback Section (WIG) at bottom left (Technical/Damage reports) */}
        <div className="mt-auto border-t border-slate-800 h-[48%] flex flex-col overflow-hidden bg-slate-950/90 backdrop-blur-md">
          <Sidebar activities={activities} onAssetClick={(id) => {
             const asset = assets.find(a => a.id === id);
             if (asset) {
               setSelectedRegionId(asset.regionId);
               setSelectedAssetId(id);
             }
          }} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-slate-950">
        <Header 
          totalIdleCost={totalIdleCost} 
          activeCount={assets.filter(a => a.status === AssetStatus.ACTIVE).length}
          ghostCount={assets.filter(a => a.status === AssetStatus.GHOST).length}
        />

        <div className="flex-1 relative">
          <MapContainer 
            assets={assets} 
            selectedRegionId={selectedRegionId}
            onRegionSelect={setSelectedRegionId}
            onAssetSelect={setSelectedAssetId} 
            selectedAssetId={selectedAssetId}
          />

          {/* Map Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-30">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="FIND CRANE ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-2.5 pl-10 w-64 focus:outline-none focus:border-emerald-500 transition-all text-sm mono shadow-2xl"
              />
              <Search className="absolute left-3 top-3 text-slate-500" size={16} />
            </form>

            {selectedRegionId && (
               <button 
               onClick={() => setSelectedRegionId(null)}
               className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-bold text-xs mono hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 shadow-xl backdrop-blur-md"
             >
               <Globe size={14} />
               COLLAPSE NATIONAL OVERVIEW
             </button>
            )}

            <button 
              onClick={() => setIsBoxSelecting(!isBoxSelecting)}
              className={`p-3 rounded-lg border transition-all flex items-center gap-2 font-bold text-xs mono shadow-xl ${isBoxSelecting ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-900/95 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Crosshair size={18} />
              {isBoxSelecting ? 'ACTIVE LIDAR SCAN' : 'REGION LASSO'}
            </button>
          </div>

          {/* Health Card Overlay */}
          <AnimatePresence>
            {selectedAssetId && (
              <HealthCard 
                asset={assets.find(a => a.id === selectedAssetId)!} 
                onClose={() => setSelectedAssetId(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
