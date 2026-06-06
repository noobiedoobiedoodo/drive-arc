import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Cookie, ExternalLink } from 'lucide-react';
import { playSound } from '../../lib/sounds';
import { useStore } from '../../store/useStore';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { setScene } = useStore();

  useEffect(() => {
    // Check if user has already accepted cookie policies
    const accepted = localStorage.getItem('drive_arc_cookies_accepted');
    if (!accepted) {
      // Small delay for clean entrance animation after initial page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    playSound('selection');
    localStorage.setItem('drive_arc_cookies_accepted', 'true');
    setIsVisible(false);
  };

  const handleViewPolicy = () => {
    playSound('selection');
    setScene('PRIVACY');
    window.history.pushState({}, '', '/privacy');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
        >
          <div className="glass-panel p-5 md:p-6 rounded-2xl border border-brand-cyan/20 bg-bg-dark/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Ambient accent background blur */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-cyan/10 blur-2xl rounded-full" />
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-brand-cyan" />
              </div>
              
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="text-xs uppercase font-mono tracking-widest text-white font-bold flex items-center gap-1.5">
                    Privacy Consent Notice
                  </h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-0.5">
                    17421745 Canada Ltd. dba Drive Arc
                  </p>
                </div>
                
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  This site uses essential cookies and processes personal/financial details to calculate pre-approval scores. By using our showroom, you agree to our PIPEDA-compliant data processing.
                </p>
                
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 py-2 bg-brand-cyan hover:bg-brand-cyan/95 text-black hover:text-black font-display font-bold uppercase tracking-wider text-[10px] rounded-lg cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleViewPolicy}
                    className="px-3 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-mono text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
                  >
                    Policy <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
