'use client';

import { useState } from 'react';
import { useNetFlowStore } from '@/lib/store';
import { optimizerEngine } from '@/services/optimizer';
import { Portfolio, ExecutionPlan } from '@/types';
import { Zap, ArrowRight, CheckCircle, XCircle, Loader } from 'lucide-react';

interface OptimizeButtonProps {
  portfolio: Portfolio;
  onOptimize: () => void;
  demoMode: boolean;
}

export default function OptimizeButton({ portfolio, onOptimize, demoMode }: OptimizeButtonProps) {
  const { executionPlan, setExecutionPlan, isExecuting, setExecuting, setError } = useNetFlowStore();
  const [showPlan, setShowPlan] = useState(false);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    
    try {
      const executionPlan_data = optimizerEngine.createExecutionPlan(portfolio, {
        riskTolerance: 50,
        minYieldThreshold: 5,
        targetYield: 12,
      });
      
      setPlan(executionPlan_data);
      setExecutionPlan(executionPlan_data);
      setShowPlan(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze portfolio');
    }
  };

  const handleExecute = async () => {
    if (!plan) {
      setExecuting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExecuting(false);
      return;
    }

    if (demoMode) {
      setExecuting(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExecuting(false);
      
      const updatedPlan = {
        ...plan!,
        steps: plan!.steps.map(step => ({
          ...step,
          status: 'completed' as const,
          txHash: `tx_${Math.random().toString(36).slice(2, 15)}`,
        })),
      };
      setPlan(updatedPlan);
      setExecutionPlan(updatedPlan);
      onOptimize();
      return;
    }

    setExecuting(true);
    
    setError(null);
    
    try {
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        
        if (step.status === 'completed') continue;

        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPlan({
          ...plan,
          steps: plan.steps.map((s, idx) => 
            idx === i ? { ...s, status: 'completed' as const } : s
          ),
        });
      }
      
      onOptimize();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const yieldChange = plan 
    ? plan.expectedYieldAfter - plan.expectedYieldBefore 
    : 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-primary), #006644)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={20} color="#000" />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Optimize Portfolio</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            AI-powered rebalancing
          </p>
        </div>
      </div>

      {!showPlan ? (
        <button 
          className="btn btn-primary" 
          onClick={handleAnalyze}
          style={{ width: '100%' }}
        >
          <Zap size={16} />
          Analyze & Optimize
        </button>
      ) : (
        <>
          {plan && plan.steps.length > 0 ? (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '14px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Actions</span>
                <span>{plan?.steps.length} steps</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '14px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Expected Yield</span>
                <span style={{ color: yieldChange >= 0 ? 'var(--accent-primary)' : 'var(--error)' }}>
                  {yieldChange >= 0 ? '+' : ''}{yieldChange.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-secondary)', 
              marginBottom: '16px',
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
            }}>
              ✓ Your portfolio is already optimized
            </p>
          )}

          {plan && plan.steps.length > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={handleExecute}
              disabled={isExecuting}
              style={{ width: '100%' }}
            >
              {isExecuting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  Execute Optimization
                </>
              )}
            </button>
          )}

          <button 
            className="btn btn-ghost" 
            onClick={() => setShowPlan(false)}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Back
          </button>
        </>
      )}

      <style jsx>{`
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}