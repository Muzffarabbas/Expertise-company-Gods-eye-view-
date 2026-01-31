
import React, { useMemo } from 'react';
import { Asset, AssetStatus, Region } from '../types';
import { REGIONS, REVENUE_RATE_PER_HOUR } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingDown, Box as BoxIcon, ChevronRight } from 'lucide-react';

interface MapContainerProps {
  assets: Asset[];
  selectedRegionId: string | null;
  selectedAssetId: string | null;
  onRegionSelect: (id: string) => void;
  onAssetSelect: (id: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  assets, 
  selectedRegionId, 
  selectedAssetId, 
  onRegionSelect, 
  onAssetSelect 
}) => {
  
  const regionalData = useMemo(() => {
    return REGIONS.map(region => {
      const regionAssets = assets.filter(a => a.regionId === region.id);
      const idleCost = regionAssets.reduce((acc, curr) => 
        acc + (REVENUE_RATE_PER_HOUR[curr.status] < 0 ? Math.abs(REVENUE_RATE_PER_HOUR[curr.status]) : 0), 0);
      
      const statusCounts = {
        [AssetStatus.ACTIVE]: regionAssets.filter(a => a.status === AssetStatus.ACTIVE).length,
        [AssetStatus.IDLE]: regionAssets.filter(a => a.status === AssetStatus.IDLE).length,
        [AssetStatus.BREAKDOWN]: regionAssets.filter(a => a.status === AssetStatus.BREAKDOWN).length,
        [AssetStatus.GHOST]: regionAssets.filter(a => a.status === AssetStatus.GHOST).length,
      };

      return {
        ...region,
        count: regionAssets.length,
        idleCost,
        statusCounts
      };
    });
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (!selectedRegionId) return [];
    return assets.filter(a => a.regionId === selectedRegionId);
  }, [assets, selectedRegionId]);

  return (
    <div className="w-full h-full bg-[#020617] relative overflow-hidden flex items-center justify-center">
      {/* Map Background Layers */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1000 600" className="w-full h-full fill-slate-800 stroke-slate-700/50 stroke-1">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Stylized KSA path */}
          <path d="M300,100 L700,150 L850,450 L600,550 L350,580 L150,450 L200,200 Z" opacity="0.5" />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {!selectedRegionId ? (
          /* GLOBAL VIEW - Regional Aggregates */
          <motion.div 
            key="global"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            {regionalData.map((reg) => {
              const x = ((reg.center[1] - 34) / 22) * 100;
              const y = (1 - (reg.center[0] - 16) / 16) * 100;

              return (
                <motion.div
                  key={reg.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => onRegionSelect(reg.id)}
                  className="absolute cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="bg-slate-900/90 border border-slate-700 hover:border-emerald-500/50 backdrop-blur-md rounded-xl p-4 w-56 shadow-2xl transition-all group overflow-hidden">
                    {/* Animated side bar based on cost */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${reg.idleCost > 20000 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mono mb-0.5">{reg.name}</h3>
                        <p className="text-white font-extrabold text-sm tracking-tight">{reg.count} ASSETS</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] mono">
                         <span className="text-slate-500">IDLE LEAKAGE</span>
                         <span className={`font-bold ${reg.idleCost > 15000 ? 'text-red-400' : 'text-slate-300'}`}>
                           {reg.idleCost.toLocaleString()} SAR/H
                         </span>
                       </div>
                       
                       {/* Mini Status Bar */}
                       <div className="h-1 w-full bg-slate-800 rounded-full flex overflow-hidden">
                         <div className="h-full bg-emerald-500" style={{ width: `${(reg.statusCounts[AssetStatus.ACTIVE] / reg.count) * 100}%` }}></div>
                         <div className="h-full bg-amber-500" style={{ width: `${(reg.statusCounts[AssetStatus.IDLE] / reg.count) * 100}%` }}></div>
                         <div className="h-full bg-red-500" style={{ width: `${(reg.statusCounts[AssetStatus.BREAKDOWN] / reg.count) * 100}%` }}></div>
                         <div className="h-full bg-purple-500" style={{ width: `${(reg.statusCounts[AssetStatus.GHOST] / reg.count) * 100}%` }}></div>
                       </div>
                    </div>
                  </div>
                  {/* Pulse Effect for Ghost Detection */}
                  {reg.statusCounts[AssetStatus.GHOST] > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* REGIONAL VIEW - Individual Assets */
          <motion.div 
            key="regional"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-20"
          >
            {filteredAssets.map((asset) => {
              // Local zoom normalization
              const region = REGIONS.find(r => r.id === selectedRegionId)!;
              const x = ((asset.coordinates[1] - region.bounds.minLng) / (region.bounds.maxLng - region.bounds.minLng)) * 100;
              const y = (1 - (asset.coordinates[0] - region.bounds.minLat) / (region.bounds.maxLat - region.bounds.minLat)) * 100;

              const isSelected = asset.id === selectedAssetId;
              const colorClass = {
                [AssetStatus.ACTIVE]: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
                [AssetStatus.IDLE]: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
                [AssetStatus.BREAKDOWN]: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
                [AssetStatus.GHOST]: 'bg-purple-500 ghost-pulse shadow-[0_0_12px_#a855f7]',
              }[asset.status];

              return (
                <motion.div
                  key={asset.id}
                  layoutId={asset.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`absolute cursor-pointer transition-all duration-300 z-20 ${isSelected ? 'scale-[2.5] z-40' : 'hover:scale-150'}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => onAssetSelect(asset.id)}
                >
                  <div className={`w-2 h-2 rounded-full border border-slate-900 ${colorClass}`} />
                  {isSelected && (
                    <div className="absolute -inset-3 border border-emerald-500/50 rounded-full animate-ping" />
                  )}
                  {/* Small Label for zoomed in view */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] mono bg-slate-900/80 px-1 py-0.5 rounded border border-slate-700">{asset.id}</span>
                  </div>
                </motion.div>
              );
            })}

            {/* Region Title Overlay */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-[0.5em] mono mb-1">Sector Live Feed</span>
                <h2 className="text-3xl font-black text-white tracking-tighter">
                  {REGIONS.find(r => r.id === selectedRegionId)?.name}
                </h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Legend */}
      <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl z-30 flex gap-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-bold uppercase mono text-slate-400">Deployed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
          <span className="text-[10px] font-bold uppercase mono text-slate-400">Idle &gt; 2h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <span className="text-[10px] font-bold uppercase mono text-slate-400">Breakdown</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
          <span className="text-[10px] font-bold uppercase mono text-slate-400">Ghost detection</span>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
