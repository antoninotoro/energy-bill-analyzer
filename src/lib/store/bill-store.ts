/**
 * Zustand store for bill analysis state management
 * SSR-safe implementation
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BollettaElettrica,
  AnalysisResult,
  OfferComparison,
} from '@/types/bill';

interface BillState {
  // Current bill data
  currentBill: BollettaElettrica | null;

  // Analysis results
  analysisResult: AnalysisResult | null;

  // Offer comparisons
  offerComparisons: OfferComparison[];

  // Historical bills (for tracking over time)
  historicalBills: AnalysisResult[];

  // UI state
  isAnalyzing: boolean;
  analysisError: string | null;

  // Actions
  setCurrentBill: (bill: BollettaElettrica) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setOfferComparisons: (comparisons: OfferComparison[]) => void;
  addToHistory: (result: AnalysisResult) => void;
  removeFromHistory: (index: number) => void;
  clearHistory: () => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentBill: null,
  analysisResult: null,
  offerComparisons: [],
  historicalBills: [],
  isAnalyzing: false,
  analysisError: null,
};

export const useBillStore = create<BillState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentBill: (bill) =>
        set({ currentBill: bill, analysisError: null }),

      setAnalysisResult: (result) =>
        set({ analysisResult: result, isAnalyzing: false }),

      setOfferComparisons: (comparisons) =>
        set({ offerComparisons: comparisons }),

      addToHistory: (result) =>
        set((state) => ({
          historicalBills: [result, ...state.historicalBills].slice(0, 10), // Keep last 10
        })),

      removeFromHistory: (index) =>
        set((state) => ({
          historicalBills: state.historicalBills.filter((_, i) => i !== index),
        })),

      clearHistory: () => set({ historicalBills: [] }),

      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      setAnalysisError: (error) =>
        set({ analysisError: error, isAnalyzing: false }),

      reset: () => set(initialState),
    }),
    {
      name: 'bill-analyzer-storage',
      storage: createJSONStorage(() => {
        // SSR-safe: only use localStorage on client
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        // Only persist historical bills, not current analysis
        historicalBills: state.historicalBills,
      }),
    }
  )
);
