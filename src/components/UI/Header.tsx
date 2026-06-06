import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Cpu } from 'lucide-react';
import { BRAND_NAME, BRAND_TAGLINE } from '../../constants';
import { useStore } from '../../store/useStore';

export const Header = () => {
  const [logoError, setLogoError] = React.useState(false);
  const { setScene } = useStore();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-4 md:py-6 flex justify-between items-center pointer-events-none"
    >
      {/* Brand Section */}
      <div className="flex items-center gap-4 pointer-events-auto group">
        <div className="relative">
          <div className="absolute -inset-4 bg-brand-cyan/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />
          
          <div className="relative flex items-center gap-3">
             <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center relative">
               {!logoError ? (
                 <img 
                   src="/logo.png" 
                   alt="Drive Arc" 
                   className="w-full h-full object-contain brightness-150 contrast-125"
                   onError={() => setLogoError(true)}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg backdrop-blur-sm">
                   <Shield className="w-6 h-6 text-brand-cyan" />
                 </div>
               )}
             </div>

             <div className="flex flex-col">
               <span className="text-xl md:text-2xl font-display font-light tracking-[0.2em] text-white uppercase leading-none">
                 {BRAND_NAME.split(' ')[0]} <span className="text-brand-cyan font-medium">{BRAND_NAME.split(' ').slice(1).join(' ')}</span>
               </span>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-[8px] md:text-[10px] text-white/40 tracking-[0.5em] uppercase font-mono leading-none">
                   {BRAND_TAGLINE}
                 </span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* System Status Section */}
      <div className="hidden sm:flex items-center gap-8 md:gap-12 pointer-events-auto">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-mono">Approval System Active</span>
            <Shield className="w-2.5 h-2.5 text-brand-cyan/50" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="text-[10px] text-brand-cyan/80 font-mono tracking-tighter">Lending Network Live</span>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-mono">Start Application</span>
            <Activity className="w-2.5 h-2.5 text-brand-cyan/50" />
          </div>
          <span className="text-[10px] text-white font-mono tracking-tighter uppercase opacity-80">Decision Engine: Live</span>
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        <button 
          onClick={() => {
            setScene('ADMIN');
            window.history.pushState({}, '', '/admin');
          }}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative cursor-pointer group/status border-0 bg-transparent outline-none focus:outline-none"
        >
          <div className="absolute inset-0 border border-white/10 rounded-full group-hover/status:border-brand-cyan/30 transition-colors" />
          <div className="absolute inset-[1px] border border-brand-cyan/5 rounded-full" />
          <Cpu className="w-5 h-5 text-white/20 group-hover/status:text-brand-cyan transition-colors" />
          
          {/* Circular progress highlight */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="50%" cy="50%" r="48%" 
              className="fill-none stroke-brand-cyan/20 stroke-[1px]" 
              strokeDasharray="40 100"
            />
          </svg>
        </button>
      </div>
    </motion.header>
  );
};
