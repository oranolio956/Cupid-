import * as React from 'react';
import { useState } from 'react';
import { DatingApp } from '../types';
import { generateInstallLogs } from '../services/geminiService';
import { X, Server, CheckCircle2, Terminal, Play, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface DependencyModalProps {
  app: DatingApp;
  onClose: () => void;
}

export const DependencyModal: React.FC<DependencyModalProps> = ({ app, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'explanation' | 'installing' | 'complete'>('explanation');

  const startInstallation = async () => {
    setStage('installing');
    await new Promise(r => setTimeout(r, 500));
    
    const aiLogs = await generateInstallLogs(app.name);
    
    const totalSteps = aiLogs.length;
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      setLogs(prev => [...prev, aiLogs[i]]);
      setProgress(((i + 1) / totalSteps) * 100);
      
      const terminal = document.getElementById('terminal-logs');
      if (terminal) terminal.scrollTop = terminal.scrollHeight;
    }

    await new Promise(r => setTimeout(r, 500));
    setStage('complete');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-[95%] max-w-[520px] max-h-[90vh] flex flex-col bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="h-14 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between px-5 shrink-0 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-zinc-200 text-sm tracking-wide">Integration Deployment</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          
          {/* Target Info */}
          <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className={`w-12 h-12 rounded-lg ${app.iconColor} flex items-center justify-center shrink-0 shadow-lg ring-1 ring-white/10`}>
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{app.name} Gateway</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500 font-mono">v2.4.1-stable</span>
              </div>
            </div>
          </div>

          {stage === 'explanation' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-zinc-200">Deployment Configuration</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You are about to provision a secure, isolated container for {app.name} automation. This process will verify SSL certificates, allocate dedicated bandwidth, and establish an encrypted tunnel.
                </p>
              </div>

              <div className="bg-zinc-900/30 rounded-lg border border-zinc-800/50 divide-y divide-zinc-800/50">
                {[
                  "SSL/TLS Certificate Verification",
                  "Isolated Runtime Environment",
                  "API Schema Synchronization"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-300 p-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage !== 'explanation' && (
            <div className="space-y-4">
               {/* Terminal */}
               <div className="rounded-lg overflow-hidden border border-zinc-800 bg-[#0c0c0e] shadow-inner">
                 <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">deployment_log.txt</span>
                 </div>
                 <div 
                   id="terminal-logs"
                   className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-400 space-y-1 scroll-smooth"
                 >
                   {logs.map((log, i) => (
                     <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                       <span className="text-zinc-600 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                       <span className="text-zinc-300">{log}</span>
                     </div>
                   ))}
                   {stage === 'installing' && (
                     <div className="flex gap-2 items-center text-zinc-500 mt-2 pl-7">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                     </div>
                   )}
                  {stage === 'complete' && (
                    <div className="mt-4 pl-7 text-emerald-400 font-bold">
                      {'>'} Deployment Successful.
                    </div>
                  )}
                 </div>
               </div>

               {/* Progress Bar */}
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    <span>Provisioning Resources</span>
                    <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                     style={{ width: `${progress}%` }}
                   />
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-900/50 border-t border-zinc-800 p-5 flex justify-end gap-3 shrink-0 sticky bottom-0 z-10 backdrop-blur-sm">
          {stage === 'explanation' ? (
            <>
              <Button variant="ghost" onClick={onClose} className="w-auto">Cancel</Button>
              <Button onClick={startInstallation} className="w-auto px-6 bg-white text-black hover:bg-zinc-200 border-none shadow-xl shadow-white/5">
                <Play size={16} className="mr-2" /> Deploy Integration
              </Button>
            </>
          ) : stage === 'complete' ? (
             <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20 shadow-lg shadow-emerald-900/20">
               Access Integration
             </Button>
          ) : (
            <Button disabled variant="secondary" className="w-full bg-zinc-800 text-zinc-400 border-zinc-700">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Provisioning...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};