/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Scene = 'ENTRY' | 'VEHICLE_SELECTOR' | 'QUESTION_FLOW' | 'PROCESSING' | 'RESULT' | 'CATALOG' | 'ADMIN';

export interface FormData {
  vehicle: string;
  email: string;
  name: string;
  phone: string;
  category?: string;
  employment: string;
  income: string;
  creditScore: string;
  monthlyDebt: string;
  housingStatus: string;
  downPayment: string;
  selectedModel?: string;
  selectedModelYear?: number;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'CONDITIONAL' | 'REVIEW';

export interface ScoreResult {
  approvalScore: number;
  riskTier: "low" | "moderate" | "high" | "very_high";
  maxLoan: number;
  monthlyEstimate: number;
  reasonCodes: string[];
  status: ApprovalStatus;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  routing: string;
  offer: string;
}

export const INITIAL_FORM_DATA: FormData = {
  vehicle: '',
  email: '',
  name: '',
  phone: '',
  employment: '',
  income: '',
  creditScore: 'good',
  monthlyDebt: '0',
  housingStatus: 'rent',
  downPayment: '0',
};

export const VEHICLE_TYPES = [
  { id: 'car', label: 'Car', model: 'sedan' },
  { id: 'suv', label: 'SUV', model: 'suv' },
  { id: 'truck', label: 'Truck', model: 'truck' },
  { id: 'van', label: 'Van', model: 'van' }
];

export const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as any;
