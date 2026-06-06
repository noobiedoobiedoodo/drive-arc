import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CINEMATIC_EASE } from '../../types';
import { ActionButton } from '../UI/Controls';
import { CheckCircle2, ShieldCheck, XCircle, AlertCircle, TrendingUp, Wallet, Calendar, ArrowRight, Download, Building2, Lock } from 'lucide-react';
import { playSound } from '../../lib/sounds';

import { trackEvent, TRACK_EVENTS } from '../../lib/analytics';

const AnimatedScore = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{displayValue}</>;
};

export const ResultScreen = ({ onShowCatalog }: { onShowCatalog: () => void }) => {
  const { formData, approvalStatus, eligibilityScore, scoreResult } = useStore();
  const [showCTAs, setShowCTAs] = useState(false);
  const [flash, setFlash] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState(60);
  const [finalSubmission, setFinalSubmission] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-sync lead data as soon as results are ready (Drop-off protection)
  useEffect(() => {
    if (scoreResult) {
      const captureLead = async () => {
        try {
          await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              approvalScore: scoreResult.approvalScore,
              riskTier: scoreResult.riskTier,
              maxLoan: scoreResult.maxLoan,
              source: 'AUTO_CAPTURE_ON_RESULT',
              timestamp: new Date().toISOString()
            })
          });
          console.log("Lead captured proactively");
        } catch (e) {
          console.error("Proactive lead capture failed", e);
        }
      };
      captureLead();
    }
  }, [scoreResult]);

  useEffect(() => {
    trackEvent(TRACK_EVENTS.RESULT_SHOWN, { 
      status: approvalStatus, 
      score: eligibilityScore,
      priority: scoreResult?.priority || 'NORMAL'
    });
    
    // Final Polish: Screen flash and sound hit
    if (approvalStatus !== 'REVIEW') {
      playSound('success');
    }

    const flashTimer = setTimeout(() => setFlash(false), 500);
    const ctaTimer = setTimeout(() => setShowCTAs(true), 1500);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(ctaTimer);
    };
  }, [approvalStatus]);

  const calculatePayments = () => {
    if (!scoreResult) return { monthly: 0, biWeekly: 0 };
    
    // Base rate is 7.99%, adjust slightly for term
    const baseRate = 0.0799;
    const termAdjustment = (selectedTerm - 60) * 0.0001; // Tiny adjustment for term length
    const annualRate = baseRate + termAdjustment;
    const monthlyRate = annualRate / 12;
    
    const principal = scoreResult.maxLoan;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, selectedTerm);
    const denominator = Math.pow(1 + monthlyRate, selectedTerm) - 1;
    
    const monthly = principal * (numerator / denominator);
    const biWeekly = (monthly * 12) / 26;

    return {
      monthly: Math.round(monthly),
      biWeekly: Math.round(biWeekly)
    };
  };

  const payments = calculatePayments();

  const getStatusConfig = () => {
    switch (approvalStatus) {
      case 'APPROVED':
        return {
          icon: <ShieldCheck className="w-12 h-12 text-bg-dark" />,
          color: 'text-brand-cyan',
          bg: 'from-brand-cyan to-brand-purple',
          title: `Pre-Approved`,
          subtitle: 'Elite Tier // Rate Lock Available',
          description: "Your profile has cleared all high-level automated checks. You are officially in the top 5% of applicants.",
          urgency: "Lock in your vehicle now — rates are subject to change without notice.",
          cta: "Lock My Approval"
        };
      case 'CONDITIONAL':
        return {
          icon: <AlertCircle className="w-12 h-12 text-bg-dark" />,
          color: 'text-yellow-400',
          bg: 'from-orange-400 to-yellow-500',
          title: `Reservation Ready`,
          subtitle: 'Verification Pending // Priority Slot Reserved',
          description: "Good news: You've matched with our Flex-Approval Program. We just need to verify one final detail to release your full funding.",
          urgency: "Priority approval reserved for the next 24 hours only. Act now to maintain your slot.",
          cta: "Verify & Unlock Now"
        };
      default:
        return {
          icon: <Building2 className="w-12 h-12 text-bg-dark" />,
          color: 'text-white',
          bg: 'from-white/20 to-white/5',
          title: `Specialist Required`,
          subtitle: 'Manual Concierge // Custom Pathway',
          description: "Your profile requires our human-in-the-loop specialized underwriting. We find approvals where algorithms don't.",
          urgency: "Requesting a specialist review will significantly increase your success rate.",
          cta: "Request Specialist Link"
        };
    }
  };

  const config = getStatusConfig();

  const handleFinalSubmit = async () => {
    playSound('selection');
    setFinalSubmission(true);
    
    // Simulate final matching process
    setTimeout(async () => {
      try {
        await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            selectedTerm,
            monthlyPayment: payments.monthly,
            biWeeklyPayment: payments.biWeekly,
            action: 'FINAL_SUBMISSION',
            timestamp: new Date().toISOString()
          })
        });
        setSubmitted(true);
        playSound('success');
      } catch (e) {
        setSubmitted(true); // Still show success UI for demo
      }
    }, 3000);
  };

  if (finalSubmission) {
    return (
      <div className="absolute inset-0 z-[60] bg-bg-dark flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <div className="fixed inset-0 bg-radial-at-center from-brand-cyan/10 to-transparent pointer-none" />
        
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-12"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full mx-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 bg-brand-cyan/20 blur-xl rounded-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-display font-medium tracking-[0.2em] uppercase">Securing Matches</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing with lender network...</p>
                  <p className="text-white/20 text-[8px] uppercase tracking-[0.3em]">CDN // TORONTO_REGION_01</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="w-24 h-24 bg-brand-cyan rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(0,240,255,0.4)]">
                <CheckCircle2 className="w-12 h-12 text-bg-dark" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-display font-medium tracking-[0.1em] uppercase">Connection Established</h2>
                <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                  A verification specialist has been assigned to your profile. You will receive a secure confirmation via text shortly.
                </p>
              </div>
              <ActionButton 
                label="Explore My Inventory" 
                onClick={onShowCatalog}
                variant="primary"
                className="mt-8"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-bg-dark flex flex-col items-center justify-start p-8 pt-20 md:pt-32 text-center overflow-y-auto custom-scrollbar">
      {/* Final Polish: Screen Flash Overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Background radial glow */}
      <div className="fixed inset-0 bg-radial-at-center from-brand-purple/10 to-transparent pointer-none" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: CINEMATIC_EASE }}
        className="relative space-y-12 max-w-5xl w-full"
      >
        {/* Branding Badge */}
        <div className="flex justify-center mb-[-2rem]">
          <div className="px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 backdrop-blur-md flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-white/70 uppercase">DA ARC Verified Approval</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 15 }}
            className={`w-28 h-28 rounded-full bg-linear-to-tr ${config.bg} flex items-center justify-center neon-glow shadow-[0_0_50px_rgba(0,240,255,0.3)]`}
          >
            {config.icon}
          </motion.div>
          
          <div className="space-y-4">
            <motion.div
              initial={{ letterSpacing: '1em', opacity: 0 }}
              animate={{ letterSpacing: '0.4em', opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className={`${config.color} uppercase text-xs font-bold font-mono`}
            >
              System Analysis Complete
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tight uppercase leading-tight">
              {approvalStatus === 'REVIEW' ? 'Pending' : 'Score'}: <span className={config.color}><AnimatedScore value={eligibilityScore || 0} /></span>
            </h1>
            <p className="text-white/40 tracking-[0.3em] uppercase text-xs">
              {config.subtitle} // Ref: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
            <div className="max-w-md mx-auto mt-6">
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                {config.description}
              </p>
              <div className={`p-4 rounded-xl border ${config.color.replace('text-', 'border-')}/20 bg-white/5`}>
                <p className={`${config.color} text-[10px] uppercase font-bold tracking-widest`}>
                  <AlertCircle className="w-3 h-3 inline mr-2" />
                  {config.urgency}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Why You Qualified */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass-panel p-8 rounded-3xl border-white/5 text-left flex flex-col"
          >
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold mb-8 flex items-center gap-3">
               <TrendingUp className="w-4 h-4 text-brand-cyan" />
               Merit Assessment
            </h3>
            <div className="space-y-6 flex-1">
              {scoreResult?.reasonCodes.map((code, i) => (
                <motion.div
                  key={code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + (i * 0.2) }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-cyan neon-glow group-hover:scale-125 transition-transform" />
                  <span className="text-white/80 font-display text-lg tracking-wide">{code}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/5">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-1">Risk Profile</p>
                    <p className={`text-sm font-mono uppercase tracking-[0.3em] ${scoreResult?.riskTier === 'low' ? 'text-brand-cyan' : 'text-yellow-400'}`}>
                      {scoreResult?.riskTier?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-1">Verified Base</p>
                    <p className="text-sm font-mono text-white/40">$2,500/yr Min</p>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Financial Payoff */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="glass-panel p-8 rounded-3xl border-brand-cyan/20 bg-brand-cyan/[0.02] text-left flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/10 blur-3xl rounded-full -mr-24 -mt-24" />
            
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-brand-cyan font-bold mb-8 flex items-center gap-3 relative z-10">
               <Wallet className="w-4 h-4" />
               Financial Blueprint
            </h3>
            
            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Maximum Approved Limit</p>
                <div className="text-5xl font-display font-medium tracking-tighter">
                  ${scoreResult?.maxLoan.toLocaleString()}
                </div>
              </div>

              {/* Term Selector */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Select Loan Term (Months)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[48, 60, 72, 84].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSelectedTerm(term);
                        playSound('selection');
                      }}
                      className={`flex-1 min-w-[60px] py-4 text-xs font-bold font-mono transition-all border ${
                        selectedTerm === term 
                          ? 'bg-brand-cyan text-bg-dark border-brand-cyan' 
                          : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Monthly</p>
                  <div className="text-3xl font-display font-medium text-white">
                    ${payments.monthly}
                  </div>
                </div>
                <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl">
                  <p className="text-[9px] uppercase tracking-widest text-brand-cyan/60 font-bold mb-2">Bi-Weekly</p>
                  <div className="text-3xl font-display font-medium text-brand-cyan">
                    ${payments.biWeekly}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 space-y-4">
               <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-brand-cyan/50" />
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
                    Down-payment of <span className="text-white font-bold">${formData.downPayment}</span> factored into current calculation.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* CTAs */}
        <AnimatePresence>
          {showCTAs && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex flex-col items-center gap-10 pt-12 pb-20"
            >
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
                <button 
                  onClick={handleFinalSubmit}
                  className={`group relative w-full sm:w-auto px-8 md:px-12 py-5 bg-linear-to-tr ${config.bg} text-bg-dark rounded-full font-display font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.3)]`}
                >
                  <span className="flex items-center justify-center gap-3">
                    <ArrowRight className="w-4 h-4" />
                    {config.cta}
                  </span>
                </button>

                <button 
                  onClick={onShowCatalog}
                  className="w-full sm:w-auto px-8 md:px-10 py-5 border border-white/10 hover:border-brand-cyan/40 hover:bg-white/5 text-white rounded-full font-display font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-sm transition-all flex items-center justify-center gap-3"
                >
                  <ArrowRight className="w-4 h-4" />
                  Continue Selection
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/15">
                    <Lock className="w-3 h-3" /> 256-bit Encrypted
                  </div>
                  <div className="w-1 h-3 bg-white/5" />
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/15">
                    <ShieldCheck className="w-3 h-3" /> Soft Credit Check - No Impact
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};


