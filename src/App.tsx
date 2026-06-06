import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { playSound } from './lib/sounds';
import { EntrySequence } from './components/Scene/EntrySequence';
import { VehiclePickerView } from './components/Scene/VehiclePickerView';
import { QuestionPanel } from './components/Scene/QuestionPanel';
import { ProcessingScreen } from './components/Scene/ProcessingScreen';
import { ResultScreen } from './components/Scene/ResultScreen';
import { CatalogScreen } from './components/Scene/CatalogScreen';
import { VehicleScene } from './components/3D/VehicleScene';
import { trackEvent, TRACK_EVENTS } from './lib/analytics';
import { AdminDashboard } from './components/Scene/AdminDashboard';

import { Header } from './components/UI/Header';

export default function App() {
  const { 
    scene, setScene, 
    formData, updateFormData,
    currentVehicleIndex, setVehicle,
    isZoomed, setZoom
  } = useStore();

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setScene('ADMIN');
    }
  }, [setScene]);

  useEffect(() => {
    console.log("App: Scene changed to:", scene);
    trackEvent(TRACK_EVENTS.STARTED_APP);
    const handleFirstInteraction = () => {
      playSound('ambient');
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [scene]);

  const handleVehicleSelect = (index: number) => {
    if (scene === 'ENTRY') return;
    setVehicle(index);
  };

  const handleConfirmVehicle = () => {
    trackEvent(TRACK_EVENTS.VEHICLE_PICKED, { type: formData.vehicle });
    playSound('selection');
    setZoom(true);
    setTimeout(() => {
      setScene('QUESTION_FLOW');
    }, 700);
  };

  const handleFormComplete = () => {
    trackEvent(TRACK_EVENTS.PROCESSING_STARTED);
    
    // Revenue Machine: Immediate Lead Capture (NON-BLOCKING)
    const { setLeadCaptured, setApprovalResult, setDataState } = useStore.getState();
    
    // 1. Inject Fallback Result immediately (Money Tier: CONDITIONAL)
    setApprovalResult('CONDITIONAL', 52); 
    setDataState('PENDING');
    
    // 2. Non-blocking network call
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then(res => {
      if (res.ok) {
        setLeadCaptured(true);
        trackEvent('LEAD_CAPTURE_SUCCESS');
      } else {
        trackEvent('LEAD_CAPTURE_FAIL', { status: res.status });
      }
    })
    .catch(err => {
      console.error("Lead capture network error", err);
      trackEvent('LEAD_CAPTURE_FAIL', { error: err.message });
    });
    
    // 3. Transition to cinematic engine instantly
    setScene('PROCESSING');

    // 4. Forced Completion Failsafe (8s Guarantee)
    setTimeout(() => {
      const currentScene = useStore.getState().scene;
      if (currentScene === 'PROCESSING') {
        console.warn("Revenue Machine: Failsafe triggered → forcing result display");
        trackEvent('PROCESSING_TIMEOUT_TRIGGERED');
        handleProcessDone();
      }
    }, 8000);
  };

  const handleProcessDone = React.useCallback(() => {
    console.log("App: handleProcessDone called. Setting scene to RESULT.");
    trackEvent(TRACK_EVENTS.PROCESSING_COMPLETED);
    setScene('RESULT');
  }, [setScene]);

  const handleShowCatalog = () => {
    trackEvent(TRACK_EVENTS.CTA_CLICKED, { action: 'view_catalog' });
    playSound('selection');
    setScene('CATALOG');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-bg-dark font-sans selection:bg-brand-cyan/30">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-purple opacity-10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-brand-cyan opacity-5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-20 bg-dots" />
      </div>

      <Header />

      <AnimatePresence>
        {(scene === 'VEHICLE_SELECTOR' || scene === 'QUESTION_FLOW' || scene === 'PROCESSING') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <VehicleScene 
              currentVehicleIndex={currentVehicleIndex} 
              onSelect={handleVehicleSelect}
              isZoomed={isZoomed}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {scene !== 'ENTRY' && scene !== 'RESULT' && scene !== 'CATALOG' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 md:bottom-8 md:left-12 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-12 opacity-50 text-[10px] uppercase tracking-[0.2em] z-30 pointer-events-none"
          >
            <div className="flex items-center space-x-3 text-brand-cyan">
              <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              <span>Ambient Connection Active</span>
            </div>
            <div className="hidden md:block h-4 w-[1px] bg-white/20" />
            <div className="flex items-center space-x-2 italic text-white/60">
              <span>Showroom Reflection Mode // Enabled</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {scene === 'ENTRY' ? (
          <EntrySequence key="entry" onComplete={() => setScene('VEHICLE_SELECTOR')} />
        ) : scene === 'VEHICLE_SELECTOR' ? (
          <VehiclePickerView 
            key="selector"
            currentVehicleIndex={currentVehicleIndex}
            onSelect={handleVehicleSelect}
            onConfirm={handleConfirmVehicle}
          />
        ) : scene === 'QUESTION_FLOW' ? (
          <QuestionPanel 
            key="questions"
            formData={formData}
            onChange={updateFormData}
            onComplete={handleFormComplete}
          />
        ) : scene === 'PROCESSING' ? (
          <ProcessingScreen key="processing" onComplete={handleProcessDone} />
        ) : scene === 'RESULT' ? (
          <ResultScreen key="result" onShowCatalog={handleShowCatalog} />
        ) : scene === 'CATALOG' ? (
          <CatalogScreen 
            key="catalog" 
            formData={formData} 
            onBack={() => setScene('RESULT')} 
            onVehicleComplete={(vehicle) => {
              updateFormData({ 
                selectedModel: vehicle.name, 
                selectedModelYear: vehicle.year 
              });
              setScene('RESULT');
              playSound('selection');
            }}
          />
        ) : scene === 'ADMIN' ? (
          <AdminDashboard
            key="admin"
            onClose={() => {
              setScene('VEHICLE_SELECTOR');
              window.history.pushState({}, '', '/');
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
