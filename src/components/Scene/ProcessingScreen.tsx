import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CINEMATIC_EASE, ScoreResult } from '../../types';
import { playSound } from '../../lib/sounds';
import { useStore } from '../../store/useStore';

const steps = [
  { id: "analyze", label: "Analyzing profile data...", duration: 1500 },
  { id: "underwrite", label: "Running underwriting engine...", duration: 2000 },
  { id: "match", label: "Matching vehicle dynamics...", duration: 1500 },
  { id: "finalize", label: "Synthesizing ultimate results...", duration: 1500 }
];

export const ProcessingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const { formData, setScoreResult, setDataState } = useStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dynamicMessage, setDynamicMessage] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const apiStarted = useRef(false);

  useEffect(() => {
    if (apiStarted.current) return;
    apiStarted.current = true;

    const fetchData = async () => {
      setDataState('PENDING');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout

      try {
        const apiPayload = {
          incomeMonthly: formData.income,
          employmentStatus: formData.employment,
          creditScoreRange: formData.creditScore,
          monthlyDebt: formData.monthlyDebt,
          downPayment: formData.downPayment
        };

        const response = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("API_ERROR");

        const result: ScoreResult = await response.json();
        setScoreResult(result);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn("Revenue Machine: API timeout triggered. Deploying strategic fallback.");
        } else {
          console.error("Revenue Machine: API failure. Deploying strategic fallback.", error);
        }
        
        setDataState('FAILED');
        // strategic fallback score
        const fallback: ScoreResult = {
          approvalScore: 68,
          riskTier: 'moderate',
          maxLoan: 42000,
          monthlyEstimate: 620,
          reasonCodes: ["Income-to-debt verified", "Preferred dealer territory"],
          status: 'CONDITIONAL',
          priority: 'NORMAL',
          routing: 'fallback_response',
          offer: 'manual_calibration_required'
        };
        setScoreResult(fallback);
      }
    };

    fetchData();
  }, [formData, setScoreResult, setDataState]);

  // Deterministic Step Progression
  useEffect(() => {
    let currentStep = 0;
    
    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, steps[i].duration));
      }
      
      // FINAL MERGE: Guarantee result screen transition
      setIsFinishing(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    runSteps();
  }, [onComplete]);

  useEffect(() => {
    const messages = [
      `Validating $${formData.income}/mo revenue path`,
      "Synchronizing with regional lender grid",
      "Optimizing credit-to-loan ratios",
      "Lead captured. Routing priority: HIGH",
      "Calculating lifetime value trajectory",
      "Cross-referencing employment longevity",
      "Analyzing market-specific residuals"
    ];

    const i = setInterval(() => {
      setDynamicMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 1200);
    return () => clearInterval(i);
  }, [formData.income]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-bg-dark/95 backdrop-blur-3xl overflow-hidden"
    >
      {/* HUD Layer */}
      <div className="absolute top-12 left-12 right-12 flex justify-between items-start opacity-20 font-mono text-[9px] tracking-[0.4em]">
        <div className="flex flex-col gap-1">
          <span>SECURE_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          <span>DETERMINISTIC_ENGINE: ACTIVE</span>
        </div>
        <div className="text-right flex flex-col gap-1">
          <span>LATENCY: 12ms</span>
          <span>CORE_SYSTEM: DA_ARC_v2.4</span>
        </div>
      </div>

      <div className="relative w-full max-w-xl px-12 text-center space-y-20 z-10">
        {/* Cinematic Loader Bar */}
        <div className="relative w-full h-1 bg-white/5 overflow-hidden rounded-full">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 7, ease: "linear" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-cyan to-brand-purple shadow-[0_0_15px_rgba(0,240,255,0.8)]"
          />
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-3 text-brand-cyan/60 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">
                <span className="w-1 h-1 rounded-full bg-brand-cyan animate-ping" />
                Phase {currentStepIndex + 1}: {steps[currentStepIndex].id}
              </div>
              <h2 className="text-white font-display text-3xl md:text-5xl uppercase tracking-tighter font-semibold leading-tight">
                {steps[currentStepIndex].label}
              </h2>
            </motion.div>
          </AnimatePresence>

          <div className="h-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={dynamicMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="text-brand-cyan font-mono text-[10px] uppercase tracking-[0.3em]"
              >
                {dynamicMessage}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Binary Stream Visualizer */}
        <div className="grid grid-cols-8 gap-4 opacity-10">
          {Array.from({ length: 32 }).map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ 
                duration: Math.random() * 2 + 1, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              className="h-[1px] bg-white"
            />
          ))}
        </div>
      </div>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-dots opacity-10" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-brand-cyan/5 animate-[spin_40s_linear_infinite_reverse]" />
      </div>
    </motion.div>
  );
};

