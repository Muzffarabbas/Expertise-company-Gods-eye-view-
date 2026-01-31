
import React from 'react';
import { TrendingDown, Activity, UserCheck, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  totalIdleCost: number;
  activeCount: number;
  ghostCount: number;
}

const Header: React.FC<HeaderProps> = ({ totalIdleCost, activeCount, ghostCount }) => {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-red-500 mb-0.5">
            <TrendingDown size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mono">Real-time Revenue Leakage</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white mono">{totalIdleCost.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500 mono">SAR/HR</span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-800"></div>

        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mono">Utilized</p>
              <p className="text-sm font-bold text-white">{activeCount} ASSETS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${ghostCount > 0 ? 'bg-purple-500/20 animate-pulse' : 'bg-slate-800'}`}>
              <Ghost size={18} className={ghostCount > 0 ? 'text-purple-400' : 'text-slate-500'} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mono">Ghost Fleet</p>
              <p className={`text-sm font-bold ${ghostCount > 0 ? 'text-purple-400' : 'text-white'}`}>{ghostCount} DETECTED</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mono">System: Operational</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
          <img src="https://picsum.photos/seed/bodhon/40/40" alt="Avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
