import React from 'react';
import { motion } from 'framer-motion';
import { CINEMATIC_EASE } from '../../types';

export const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="fixed top-0 left-0 w-full h-[4px] bg-white/5 z-50 shadow-[0_0_15px_rgba(14,165,233,0.5)]">
    <motion.div
      className="h-full bg-linear-to-r from-brand-cyan to-brand-purple"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
    />
  </div>
);

export const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="relative group pt-4">
    <label className="absolute -top-1 left-0 text-[10px] uppercase tracking-widest text-white/30 group-focus-within:text-brand-cyan transition-colors">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border-b border-white/20 p-4 focus:outline-hidden focus:border-brand-cyan transition-all text-white/80 placeholder:text-white/10 font-sans"
    />
  </div>
);

export const ActionButton = ({ children, onClick, active = false, className = '' }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative group h-[56px] md:h-[64px] overflow-hidden border border-brand-cyan font-display uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-bold transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] ${
      active ? "text-brand-cyan" : "text-white/60 border-white/20"
    } ${className}`}
  >
    <span className="relative z-10 block px-6 md:px-8 cinematic-ease group-hover:translate-y-[-150%]">
      {children}
    </span>
    <div className="absolute inset-0 bg-brand-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    <span className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 text-black transition-all duration-300 z-20 px-6 md:px-8">
      {children}
    </span>
  </motion.button>
);
