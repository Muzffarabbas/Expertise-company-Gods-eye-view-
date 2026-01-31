
import React from 'react';
import { ActivityEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Zap, Ghost, Target, Wrench } from 'lucide-react';

interface SidebarProps {
  activities: ActivityEvent[];
  onAssetClick: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activities, onAssetClick }) => {
  return (
    <div className="h-full flex flex-col bg-slate-950 border-t border-slate-800">
      <div className="p-4 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-red-500" />
          <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mono">Live Technical Diagnostics</h2>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_#ef4444]"></div>
          <span className="text-[9px] font-bold mono">URGENT</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4 relative scroll-smooth">
        <div className="absolute left-[31px] top-0 bottom-0 w-px bg-slate-900"></div>
        
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 opacity-20">
            <Zap size={24} className="mb-2" />
            <p className="text-[10px] mono uppercase tracking-widest">No Active Faults</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {activities.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative pl-10 group cursor-pointer"
                  onClick={() => onAssetClick(event.assetId)}
                >
                  <div className={`absolute left-[-13px] top-0 w-6 h-6 rounded-full border-4 border-slate-950 z-10 flex items-center justify-center transition-all duration-300
                    ${event.type === 'GHOST_DETECTED' ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.6)]' : 
                      event.type === 'MAINTENANCE_ALERT' ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]' : 
                      'bg-slate-800 group-hover:bg-amber-600 shadow-md'}`}>
                    {event.type === 'GHOST_DETECTED' ? <Ghost size={12} className="text-white" /> :
                     event.type === 'MAINTENANCE_ALERT' ? <AlertTriangle size={12} className="text-white" /> :
                     <Zap size={12} className="text-white" />}
                  </div>

                  <div className={`p-3 rounded-lg border transition-all duration-200 ${
                    event.type === 'GHOST_DETECTED' ? 'bg-purple-950/20 border-purple-800/30' : 
                    event.type === 'MAINTENANCE_ALERT' ? 'bg-red-950/20 border-red-800/30 shadow-[inset_0_0_15px_rgba(220,38,38,0.05)]' : 
                    'bg-slate-900/60 border-slate-800/60 group-hover:border-slate-600'
                  }`}>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-500 mono">{event.assetId}</span>
                      <span className="text-[9px] text-slate-500 font-bold mono">{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal font-medium tracking-tight">
                      {event.message}
                    </p>
                    
                    {event.type === 'MAINTENANCE_ALERT' && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[8px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 uppercase mono">Hardware Fault</span>
                        <div className="flex-1 h-[1px] bg-red-500/10"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Sidebar Footer info */}
      <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between">
        <span className="text-[9px] text-slate-600 font-bold mono">TOTAL SYSTEM FAULTS: {activities.filter(a => a.type === 'MAINTENANCE_ALERT').length}</span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-75"></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
