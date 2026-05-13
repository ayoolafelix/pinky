import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Portfolio, ExecutionPlan, ExecutionHistory, ExecutionStep } from '../types';

interface PinkyState {
  walletConnected: boolean;
  walletAddress: string | null;
  demoMode: boolean;
  portfolio: Portfolio | null;
  executionPlan: ExecutionPlan | null;
  executionHistory: ExecutionHistory[];
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;
  viewMode: 'dashboard' | 'treasury' | 'analytics' | 'settings';

  setWalletConnected: (connected: boolean, address?: string) => void;
  setDemoMode: (demo: boolean) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setExecutionPlan: (plan: ExecutionPlan | null) => void;
  addExecutionHistory: (history: ExecutionHistory) => void;
  addStepExecutionResult: (stepId: string, result: Partial<ExecutionStep>) => void;
  setLoading: (loading: boolean) => void;
  setExecuting: (executing: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: 'dashboard' | 'treasury' | 'analytics' | 'settings') => void;
  reset: () => void;
}

const initialState = {
  walletConnected: false,
  walletAddress: null,
  demoMode: false,
  portfolio: null,
  executionPlan: null,
  executionHistory: [],
  isLoading: false,
  isExecuting: false,
  error: null,
  viewMode: 'dashboard' as const,
};

export const usePinkyStore = create<PinkyState>()(
  persist(
    (set) => ({
      ...initialState,

      setWalletConnected: (connected, address) =>
        set({ 
          walletConnected: connected, 
          walletAddress: address || null,
          demoMode: false,
        }),

      setDemoMode: (demo) =>
        set({ demoMode: demo, walletConnected: false, walletAddress: null }),

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

      setViewMode: (mode) => set({ viewMode: mode }),

      reset: () => set(initialState),
    }),
    {
      name: 'pinky-storage',
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        demoMode: state.demoMode,
        viewMode: state.viewMode,
      }),
    }
  )
);