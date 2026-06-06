import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CINEMATIC_EASE } from '../../types';
import { playSound } from '../../lib/sounds';

export const EntrySequence = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark"
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: CINEMATIC_EASE }}
    >
      <div className="absolute top-0 left-0 w-full h-[4px] bg-linear-to-r from-brand-cyan to-brand-purple z-50 shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
      
      <div className="relative group text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2, ease: CINEMATIC_EASE }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full h-full"
            >
              <img 
                src="/logo.png" 
                className="w-full h-full object-contain brightness-150 contrast-125" 
                alt="DA ARC Logo"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-brand-cyan/20 blur-2xl rounded-full -z-10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-brand-cyan text-[10px] tracking-[0.8em] font-medium uppercase"
          >
            DRIVE ARC
          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1.5, ease: CINEMATIC_EASE }}
          className="text-2xl md:text-5xl font-light tracking-[0.3em] uppercase text-white/90 text-glow"
        >
          Approval starts with a choice.
        </motion.p>
        
        {/* Cinematic light sweep */}
        <motion.div
          initial={{ x: '-150%' }}
          animate={{ x: '150%' }}
          transition={{ delay: 2.2, duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent skew-x-[30deg] blur-xl"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ delay: 3.5, duration: 2, repeat: Infinity }}
          className="mt-12 text-[10px] uppercase tracking-[0.5em] text-white/30"
        >
          Initializing Showroom Mode
        </motion.div>
      </div>
    </motion.div>
  );
};
