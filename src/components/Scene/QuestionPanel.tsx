import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, CINEMATIC_EASE } from '../../types';
import { InputField, ActionButton, ProgressBar } from '../UI/Controls';
import { playSound } from '../../lib/sounds';
import { useStore } from '../../store/useStore';

interface QuestionPanelProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  onComplete: () => void;
}

export const QuestionPanel = ({ formData, onChange, onComplete }: QuestionPanelProps) => {
  const [step, setStep] = useState(0);
  const setScene = useStore(state => state.setScene);
  const consent = formData.privacyConsent || false;
  const setConsent = (val: boolean) => onChange({ privacyConsent: val });
  const marketingConsent = formData.marketingConsent || false;
  const setMarketingConsent = (val: boolean) => onChange({ marketingConsent: val });

  const steps = [
    {
      id: 'contact',
      header: 'Let’s make this official',
      subtext: 'We need your basic details to register your pre-approval',
      component: (
        <div className="space-y-6 pt-4">
          <InputField 
            label="Full Name" 
            placeholder="Enter your name"
            value={formData.name}
            onChange={(v: string) => onChange({ name: v })}
          />
          <InputField 
            label="Email Address" 
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(v: string) => onChange({ email: v })}
          />
          <InputField 
            label="Phone Number" 
            placeholder="+1 (000) 000-0000"
            value={formData.phone}
            onChange={(v: string) => onChange({ phone: v })}
          />
          
          {/* Privacy Consent Checkboxes (PIPEDA & CASL Compliance) */}
          <div className="space-y-4 pt-2">
            {/* Mandatory PIPEDA Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-check"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  playSound('selection');
                }}
                className="mt-1 cursor-pointer w-4 h-4 rounded-sm border-white/20 bg-white/5 checked:bg-brand-cyan checked:border-brand-cyan focus:ring-0 focus:ring-offset-0 text-brand-cyan shrink-0"
              />
              <label htmlFor="consent-check" className="text-[11px] text-white/50 leading-normal cursor-pointer select-none">
                I consent to <strong>17421745 Canada Ltd.</strong> (operating as Drive Arc) collecting, storing, and processing my details to estimate my auto financing pre-approval limit, as outlined in the{' '}
                <button
                  type="button"
                  onClick={() => {
                    setScene('PRIVACY');
                    window.history.pushState({}, '', '/privacy');
                  }}
                  className="text-brand-cyan hover:underline bg-transparent border-0 p-0 inline font-inherit cursor-pointer text-left align-baseline"
                >
                  Privacy Policy
                </button>.
              </label>
            </div>

            {/* Optional CASL Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketing-consent-check"
                checked={marketingConsent}
                onChange={(e) => {
                  setMarketingConsent(e.target.checked);
                  playSound('selection');
                }}
                className="mt-1 cursor-pointer w-4 h-4 rounded-sm border-white/20 bg-white/5 checked:bg-brand-cyan checked:border-brand-cyan focus:ring-0 focus:ring-offset-0 text-brand-cyan shrink-0"
              />
              <label htmlFor="marketing-consent-check" className="text-[11px] text-white/40 leading-normal cursor-pointer select-none">
                [Optional] I consent to receive promotional emails, text messages, and updates from Drive Arc and <strong>17421745 Canada Ltd.</strong> regarding auto financing programs. I can unsubscribe at any time.
              </label>
            </div>
            
            <p className="text-[10px] text-white/30 italic leading-relaxed pl-7">
              Notice: To help you if you get disconnected, we securely save your progress under PIPEDA consent guidelines.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'employment',
      header: 'Employment status',
      subtext: 'Select your current primary status',
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {[
            { label: 'Full-Time', val: 'full-time' },
            { label: 'Part-Time', val: 'part-time' },
            { label: 'Self-Employed', val: 'self-employed' },
            { label: 'Unemployed', val: 'unemployed' }
          ].map((type) => (
            <button
              key={type.val}
              type="button"
              onClick={() => {
                onChange({ employment: type.val });
                playSound('selection');
              }}
              className={`py-4 md:py-5 px-4 border text-left transition-all duration-300 relative overflow-hidden group ${
                formData.employment === type.val
                  ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                  : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/60'
              }`}
            >
              <div className="relative z-10">
                <div className="text-[9px] uppercase tracking-widest opacity-50 mb-1">Status</div>
                <div className="text-sm font-medium tracking-wide">
                  {type.label}
                </div>
              </div>
              {formData.employment === type.val && (
                <motion.div 
                  layoutId="employment-accent"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-brand-cyan" 
                />
              )}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'income',
      header: 'Estimated monthly income',
      subtext: 'Select your average revenue stream',
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {[
            { label: '< $2,500', val: '2000' },
            { label: '$2,500 - $5k', val: '3500' },
            { label: '$5k - $7.5k', val: '6000' },
            { label: '$7.5k - $10k', val: '8500' },
            { label: '$10k - $15k', val: '12500' },
            { label: '$15k+', val: '20000' }
          ].map((range) => (
            <button
              key={range.val}
              type="button"
              onClick={() => {
                onChange({ income: range.val });
                playSound('selection');
              }}
              className={`py-3 md:py-4 px-4 border text-left transition-all duration-300 relative overflow-hidden group ${
                formData.income === range.val
                  ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan'
                  : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/60'
              }`}
            >
              <div className="relative z-10">
                <div className="text-[9px] uppercase tracking-tighter opacity-50 mb-1">Monthly Approx</div>
                <div className="text-sm font-medium tracking-wide">
                  {range.label}
                </div>
              </div>
              {formData.income === range.val && (
                <motion.div 
                  layoutId="income-accent"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-brand-cyan" 
                />
              )}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'creditScore',
      header: 'Estimated credit profile',
      subtext: 'This is a soft check only',
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {[
            { label: 'Excellence (760+)', val: 'excellent' },
            { label: 'Strong (700-759)', val: 'good' },
            { label: 'Established (640-699)', val: 'fair' },
            { label: 'Challenged (639 or lower)', val: 'poor' }
          ].map((range) => (
            <button
              key={range.val}
              type="button"
              onClick={() => {
                onChange({ creditScore: range.val });
                playSound('selection');
              }}
              className={`py-4 md:py-6 px-4 border text-left transition-all duration-300 relative overflow-hidden group ${
                formData.creditScore === range.val
                  ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan'
                  : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/60'
              }`}
            >
              <div className="relative z-10">
                <div className="text-[9px] uppercase tracking-widest opacity-50 mb-1">Risk Band</div>
                <div className="text-sm font-medium tracking-wide">
                  {range.label}
                </div>
              </div>
              {formData.creditScore === range.val && (
                <motion.div 
                  layoutId="credit-accent"
                  className="absolute left-0 bottom-0 top-0 w-1 bg-brand-cyan" 
                />
              )}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'financials',
      header: 'Monthly obligations',
      subtext: 'Existing debt and savings',
      component: (
        <div className="space-y-6 pt-4">
          <InputField 
            label="Current Monthly Debt" 
            placeholder="e.g. 500 (Car, Credit Cards, Loans)"
            value={formData.monthlyDebt}
            onChange={(v: string) => onChange({ monthlyDebt: v })}
          />
          <InputField 
            label="Down Payment Capacity" 
            placeholder="e.g. 2500"
            value={formData.downPayment}
            onChange={(v: string) => onChange({ downPayment: v })}
          />
        </div>
      )
    },
    {
      id: 'housing',
      header: 'Housing status',
      component: (
        <div className="grid grid-cols-1 gap-4 pt-4">
          {[
            { label: 'Private Ownership', val: 'own' },
            { label: 'Lease / Rental', val: 'rent' },
            { label: 'Family Residence', val: 'living_with_family' }
          ].map((type) => (
            <button
              key={type.val}
              type="button"
              onClick={() => {
                onChange({ housingStatus: type.val });
                playSound('selection');
              }}
              className={`py-4 md:py-5 px-6 md:px-8 border text-left transition-all duration-300 flex items-center justify-between group ${
                formData.housingStatus === type.val
                  ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan'
                  : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30'
              }`}
            >
              <span className="text-sm uppercase tracking-[0.2em] font-medium">{type.label}</span>
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.housingStatus === type.val ? 'border-brand-cyan bg-brand-cyan' : 'border-white/10'
              }`} />
            </button>
          ))}
        </div>
      )
    }
  ];

  const handleNext = () => {
    // Basic validation
    const currentStep = steps[step];
    if (currentStep.id === 'contact') {
      if (!formData.name) return;
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return;
      if (!formData.phone) return;
      if (!consent) return;
    }
    if (currentStep.id === 'employment' && !formData.employment) return;
    if (currentStep.id === 'creditScore' && !formData.creditScore) return;
    if (currentStep.id === 'housing' && !formData.housingStatus) return;

    // Background Shadow Capture for key milestones
    if (['contact', 'income', 'financials', 'housing'].includes(currentStep.id)) {
      import('../../lib/analytics').then(({ syncLeadData }) => {
        syncLeadData(formData, 'PARTIAL');
      });
    }

    playSound('transition');
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      import('../../lib/analytics').then(({ trackEvent, TRACK_EVENTS }) => {
        trackEvent(TRACK_EVENTS.FORM_SUBMITTED);
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      playSound('transition');
      setStep(step - 1);
    }
  };

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      <ProgressBar progress={progress} />
      
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
          className="glass-panel w-full max-w-[500px] h-full p-6 md:p-16 flex flex-col justify-center pointer-events-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: CINEMATIC_EASE }}
              className="flex flex-col h-full"
            >
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-brand-cyan font-bold">
                      CPE v1 // {String(step + 1).padStart(2, '0')}
                    </span>
                    <div className="h-[1px] w-12 bg-white/10" />
                  </div>
                  {step > 0 && (
                    <button 
                      onClick={handleBack}
                      className="text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-brand-cyan transition-colors"
                    >
                      [ &larr; Back ]
                    </button>
                  )}
                </div>
                <motion.h2 
                  key={`header-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-medium mb-4 leading-[1.1] tracking-tight"
                >
                  {currentStep.header}
                </motion.h2>
                <motion.p 
                  key={currentStep.id === 'creditScore' && formData.creditScore === 'poor' ? 'cinematic' : `sub-${step}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`text-sm font-light tracking-wide max-w-sm ${
                    currentStep.id === 'creditScore' && formData.creditScore === 'poor' 
                      ? 'text-brand-cyan font-medium italic' 
                      : 'text-white/40'
                  }`}
                >
                  {currentStep.id === 'creditScore' && formData.creditScore === 'poor' 
                    ? "Relax – this isn't our first rodeo. We specialize in boutique pathways for every profile. Let's build your case."
                    : currentStep.subtext}
                </motion.p>
              </div>

              <div className="flex-1 flex flex-col justify-start space-y-10">
                <div className="relative">
                  {currentStep.component}
                </div>
                
                <div className="pt-4 mt-auto">
                  <ActionButton 
                    active={Boolean(
                      (currentStep.id === 'contact' && 
                        formData.name && 
                        formData.email && 
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
                        formData.phone &&
                        consent) ||
                      (currentStep.id === 'employment' && formData.employment) ||
                      (currentStep.id === 'income' && formData.income) ||
                      (currentStep.id === 'creditScore' && formData.creditScore) ||
                      (currentStep.id === 'financials' && formData.monthlyDebt && formData.downPayment) ||
                      (currentStep.id === 'housing' && formData.housingStatus)
                    )}
                    className="w-full" 
                    onClick={handleNext}
                  >
                    {step === steps.length - 1 ? "Secure Approval" : "Analyze & Continue"}
                  </ActionButton>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 opacity-20 hover:opacity-40 transition-opacity cursor-default">
                    <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.2em]">Encrypted Connection Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-6 flex items-center justify-between text-[9px] font-mono border-t border-white/5">
                <span className="opacity-10 tracking-widest">COORD_LAT: {34.0522 + (step * 2.5)}</span>
                <button 
                  onClick={() => {
                    setScene('PRIVACY');
                    window.history.pushState({}, '', '/privacy');
                  }}
                  className="text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest bg-transparent border-0 p-0 cursor-pointer font-mono text-[9px]"
                >
                  Privacy Policy // PIPEDA
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
