
import React from 'react';
import { CompressionStatus } from '../types';

interface CompressionStepsProps {
  status: CompressionStatus;
  progress: number;
}

const CompressionSteps: React.FC<CompressionStepsProps> = ({ status, progress }) => {
  const steps = [
    { id: CompressionStatus.ANALYZING, label: 'AI Analysis' },
    { id: CompressionStatus.COMPRESSING, label: 'Compressing' },
    { id: CompressionStatus.COMPLETED, label: 'Finish' }
  ];

  const getStatusColor = (stepStatus: CompressionStatus) => {
    const statusOrder = [
        CompressionStatus.IDLE, 
        CompressionStatus.LOADING_FFMPEG, 
        CompressionStatus.ANALYZING, 
        CompressionStatus.COMPRESSING, 
        CompressionStatus.COMPLETED
    ];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (status === CompressionStatus.ERROR) return 'text-red-400';
    if (currentIndex > stepIndex) return 'text-emerald-400';
    if (currentIndex === stepIndex) return 'text-blue-400 animate-pulse';
    return 'text-slate-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${getStatusColor(step.id)}`}>
              {step.label}
            </div>
            <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
              status === step.id || (steps.findIndex(s => s.id === status) > idx) 
              ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
          </div>
        ))}
      </div>
      
      {status === CompressionStatus.COMPRESSING && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Processing frames...</span>
            <span className="text-blue-400 font-mono">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden p-1">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressionSteps;
