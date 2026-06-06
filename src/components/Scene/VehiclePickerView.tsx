import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VEHICLE_TYPES, CINEMATIC_EASE } from '../../types';
import { ActionButton } from '../UI/Controls';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { playSound } from '../../lib/sounds';

interface VehicleSelectorProps {
  currentVehicleIndex: number;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}

export const VehiclePickerView = ({ currentVehicleIndex, onSelect, onConfirm }: VehicleSelectorProps) => {
  const current = VEHICLE_TYPES[currentVehicleIndex];

  const handleNext = () => {
    onSelect((currentVehicleIndex + 1) % VEHICLE_TYPES.length);
  };

  const handlePrev = () => {
    onSelect((currentVehicleIndex - 1 + VEHICLE_TYPES.length) % VEHICLE_TYPES.length);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-6 z-10">
      {/* Live System Sync Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 md:top-12 md:right-12 z-50 flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
        <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/50">
          Approval <span className="text-brand-cyan">Ready</span>
        </span>
      </motion.div>

      <div className="w-full max-w-4xl mb-12 md:mb-32 text-center relative px-6">
        {/* Subtle Atmospheric HUD Elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-brand-cyan/20 -translate-x-4 -translate-y-4" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-brand-cyan/20 translate-x-4 -translate-y-4" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, letterSpacing: '0.5em', filter: 'blur(10px)' }}
            animate={{ opacity: 1, letterSpacing: '0.15em', filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: CINEMATIC_EASE }}
            className="flex flex-col items-center"
          >
            <h1 className="text-6xl md:text-9xl font-display font-light text-white mb-2 uppercase tracking-[0.2em] relative">
              {current.label}
              <motion.span 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-2 bg-brand-cyan/5 blur-2xl rounded-full" 
              />
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center gap-4 text-brand-cyan/40 text-[10px] uppercase tracking-[0.5em] font-mono"
            >
              <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              Vehicle Type Selected
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between md:justify-center gap-4 md:gap-20 w-full max-w-md md:max-w-none relative z-20 px-4">
        <button 
          onClick={handlePrev}
          className="p-4 md:p-8 rounded-full border border-white/5 hover:border-brand-cyan/30 bg-black/40 backdrop-blur-xl transition-all group shrink-0 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-cyan/0 group-hover:bg-brand-cyan/5 transition-colors" />
          <ChevronLeft className="w-6 h-6 md:w-10 md:h-10 text-white/20 group-hover:text-brand-cyan transition-colors" />
        </button>

        <ActionButton 
          onClick={onConfirm} 
          active 
          className="flex-1 md:flex-initial md:min-w-[450px] h-16 md:h-24 text-sm md:text-base tracking-[0.2em] md:tracking-[0.4em] uppercase font-light border-white/10 hover:border-brand-cyan/40 bg-black/40 backdrop-blur-xl"
        >
          Start My Approval
        </ActionButton>

        <button 
          onClick={handleNext}
          className="p-4 md:p-8 rounded-full border border-white/5 hover:border-brand-cyan/30 bg-black/40 backdrop-blur-xl transition-all group shrink-0 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-cyan/0 group-hover:bg-brand-cyan/5 transition-colors" />
          <ChevronRight className="w-6 h-6 md:w-10 md:h-10 text-white/20 group-hover:text-brand-cyan transition-colors" />
        </button>
      </div>
    </div>
  );
};
