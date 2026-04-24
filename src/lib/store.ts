import { create } from 'zustand';
import { Portfolio, ExecutionPlan, ExecutionHistory, ExecutionStep } from '../types';

interface PinkyState {
  walletConnected: boolean;
  walletAddress: string | null;
  portfolio: Portfolio | null;
  executionPlan: ExecutionPlan | null;
  executionHistory: ExecutionHistory[];
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;

  setWalletConnected: (connected: boolean, address?: string) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setExecutionPlan: (plan: ExecutionPlan | null) => void;
  addExecutionHistory: (history: ExecutionHistory) => void;
  addStepExecutionResult: (stepId: string, result: Partial<ExecutionStep>) => void;
  setLoading: (loading: boolean) => void;
  setExecuting: (executing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePinkyStore = create<PinkyState>((set) => ({
  walletConnected: false,
  walletAddress: null,
  portfolio: null,
  executionPlan: null,
  executionHistory: [],
  isLoading: false,
  isExecuting: false,
  error: null,

  setWalletConnected: (connected, address) =>
    set({ walletConnected: connected, walletAddress: address || null }),

  setPortfolio: (portfolio) => set({ portfolio }),

  setExecutionPlan: (plan) => set({ executionPlan: plan }),

  addExecutionHistory: (history) =>
    set((state) => ({
      executionHistory: [history, ...state.executionHistory].slice(0, 50),
    })),

  addStepExecutionResult: (stepId, result) =>
    set((state) => {
      if (!state.executionPlan) return state;
      const steps = state.executionPlan.steps.map((step) =>
        step.id === stepId ? { ...step, ...result } : step
      );
      return { executionPlan: { ...state.executionPlan, steps } };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setExecuting: (executing) => set({ isExecuting: executing }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      walletConnected: false,
      walletAddress: null,
      portfolio: null,
      executionPlan: null,
      executionHistory: [],
      isLoading: false,
      isExecuting: false,
      error: null,
    }),
}));