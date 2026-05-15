'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Zap, Activity } from 'lucide-react';
import { useApp } from '@/lib/i18n/AppContext';

export function ScanningAnimation() {
  const { t } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    { icon: Search, text: 'Fetching blockchain data...' },
    { icon: Activity, text: 'Analyzing patterns...' },
    { icon: Zap, text: 'Applying risk models...' },
    { icon: Shield, text: 'Finalizing security score...' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 700); // Progress every 700ms (total ~2.8s for all steps)
    
    return () => clearInterval(interval);
  }, [STEPS.length]);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center relative">
          {/* Radar sweep effect */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute inset-2 rounded-full border-2 border-blue-300 opacity-50 animate-spin" style={{ animationDuration: '3s', borderTopColor: 'transparent', borderLeftColor: 'transparent' }}></div>
          <Shield className="w-10 h-10 text-blue-600 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2 w-full max-w-xs relative z-10">
        <h3 className="font-semibold text-gray-900 text-lg">
          {t('analyzing') || 'Deep Analysis Running'}
        </h3>
        
        <div className="space-y-3 mt-6 text-left">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 text-sm transition-all duration-300 transform ${
                  isActive ? 'text-blue-700 font-medium scale-105 origin-left' : 
                  isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  isActive ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-100' : 
                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{step.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
