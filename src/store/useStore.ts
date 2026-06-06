import { create } from 'zustand';
import { Scene, FormData, INITIAL_FORM_DATA, VEHICLE_TYPES, ScoreResult, ApprovalStatus } from '../types';

interface AppState {
  // Global Navigation
  scene: Scene;
  
  // User Data
  formData: FormData;
  leadCaptured: boolean;
  
  // Selection State
  currentVehicleIndex: number;
  isZoomed: boolean;
  
  // Engine Output
  eligibilityScore: number | null;
  approvalStatus: ApprovalStatus;
  scoreResult: ScoreResult | null;
  dataState: 'PENDING' | 'READY' | 'FAILED';
  
  // Actions
  setScene: (scene: Scene) => void;
  updateFormData: (updates: Partial<FormData>) => void;
  setVehicle: (index: number) => void;
  setZoom: (isZoomed: boolean) => void;
  setApprovalResult: (status: ApprovalStatus, score: number) => void;
  setScoreResult: (result: ScoreResult) => void;
  setLeadCaptured: (status: boolean) => void;
  setDataState: (state: AppState['dataState']) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  scene: 'ENTRY',
  formData: {
    ...INITIAL_FORM_DATA,
    vehicle: VEHICLE_TYPES[1].label
  },
  leadCaptured: false,
  currentVehicleIndex: 1,
  isZoomed: false,
  eligibilityScore: null,
  approvalStatus: 'PENDING',
  scoreResult: null,
  dataState: 'PENDING',

  setScene: (scene) => set({ scene }),
  
  updateFormData: (updates) => set((state) => ({
    formData: { ...state.formData, ...updates }
  })),

  setVehicle: (index) => set((state) => ({
    currentVehicleIndex: index,
    formData: { ...state.formData, vehicle: VEHICLE_TYPES[index].label }
  })),

  setZoom: (isZoomed) => set({ isZoomed }),

  setApprovalResult: (approvalStatus, eligibilityScore) => set({
    approvalStatus,
    eligibilityScore
  }),

  setScoreResult: (scoreResult) => set({ 
    scoreResult,
    approvalStatus: scoreResult.status,
    eligibilityScore: scoreResult.approvalScore,
    dataState: 'READY'
  }),

  setLeadCaptured: (leadCaptured) => set({ leadCaptured }),
  
  setDataState: (dataState) => set({ dataState }),

  reset: () => set({
    scene: 'ENTRY',
    formData: INITIAL_FORM_DATA,
    leadCaptured: false,
    currentVehicleIndex: 1,
    isZoomed: false,
    eligibilityScore: null,
    approvalStatus: 'PENDING',
    scoreResult: null,
    dataState: 'PENDING'
  })
}));
