
import React, { useEffect, useState } from 'react';
import { X, Cpu, Thermometer, ShieldAlert, Zap, Navigation, ClipboardCheck, ArrowRight, Building2, MapPin, Briefcase } from 'lucide-react';
import { Asset, AssetStatus } from '../types';
import { getPredictiveInsight } from '../services/geminiService';
import { motion } from 'framer-motion';

interface HealthCardProps {
  asset: Asset;
  onClose: () => void;
}

const HealthCard: React.FC<HealthCardProps> = ({ asset, onClose }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      const insight = await getPredictiveInsight(asset);
      setAiInsight(insight);
      setLoading(false);
    };
    fetchInsight();
  }, [asset.id]);

  const statusColors = {
    [AssetStatus.ACTIVE]: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    [AssetStatus.IDLE]: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    [AssetStatus.BREAKDOWN]: 'text-red-500 bg-red-500/10 border-red-500/20',
    [AssetStatus.GHOST]: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute top-0 right-0 h-full w-[460px] bg-slate-900/98 backdrop-blur-2xl border-l border-slate-700 z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
    >
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
            <Cpu className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight mono">{asset.id}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase mono ${statusColors[asset.status]}`}>
                {asset.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-slate-500 font-bold mono">MOD: {asset.model}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Site Details Section */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <MapPin size={16} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase mono">Current Site</span>
              <span className="text-xs font-bold text-slate-200">{asset.siteName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <Building2 size={16} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase mono">Client Entity</span>
              <span className="text-xs font-bold text-slate-200">{asset.clientCompany}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <Briefcase size={16} className="text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase mono">Assigned Mission</span>
              <span className="text-xs font-bold text-slate-200 italic">{asset.assignedJob}</span>
            </div>
          </div>
        </div>

        {/* Digital Twin Schematic Visual */}
        <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group shadow-inner">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
             <div className="w-56 h-56 border-2 border-dashed border-emerald-500/50 rounded-full animate-spin-slow"></div>
          </div>
          <img 
            src={`https://picsum.photos/seed/${asset.id}/600/350`} 
            alt="Asset Schematic" 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-slate-900/85 p-4 border border-emerald-500/30 rounded-lg backdrop-blur-md shadow-2xl">
               <span className="text-[10px] text-emerald-400 font-bold uppercase mono tracking-[0.2em] animate-pulse">Telemetry Active</span>
            </div>
          </div>
        </div>

        {/* Health Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Thermometer size={14} />
              <span className="text-[10px] font-bold uppercase mono">Structural Stress</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white mono">{asset.stressScore}%</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
                <div 
                  className={`h-full transition-all duration-1000 ${asset.stressScore > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                  style={{ width: `${asset.stressScore}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Zap size={14} />
              <span className="text-[10px] font-bold uppercase mono">Utilization (LMI)</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white mono">{asset.lmiValue.toFixed(0)}%</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${asset.lmiValue}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 relative overflow-hidden group backdrop-blur-md">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
            <Cpu size={50} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mono">Bodhon AI Maintenance Agent</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
            {loading ? (
              <span className="flex items-center gap-2 animate-pulse text-emerald-300">
                Parsing sensor logs from {asset.siteName}...
              </span>
            ) : aiInsight}
          </p>
        </div>

        {/* Logistics Controls */}
        <div className="space-y-4 pb-8">
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 transition-all group active:scale-95">
            <Navigation size={20} />
            <span className="uppercase text-xs tracking-widest">DEPLOY TO {asset.regionId.toUpperCase()} BACKUP HUB</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-xl border border-slate-700 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg">
            <ClipboardCheck size={20} />
            <span className="uppercase text-xs tracking-widest">CERTIFY FOR {asset.tonnage}T LIFT</span>
          </button>
        </div>
      </div>
      
      {/* Bottom Ticker Info */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-[10px] font-bold text-slate-600 flex justify-between mono">
        <div className="flex gap-4">
          <span>LAT: {asset.coordinates[0].toFixed(5)}</span>
          <span>LNG: {asset.coordinates[1].toFixed(5)}</span>
        </div>
        <span className="text-emerald-600/80">SITE SYNC STABLE</span>
      </div>
    </motion.div>
  );
};

export default HealthCard;
