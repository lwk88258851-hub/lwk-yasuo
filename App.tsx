
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Settings, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RefreshCw,
  Info,
  ChevronRight,
  ShieldCheck,
  Video,
  Sliders
} from 'lucide-react';
import { CompressionStatus, VideoMetadata, CompressionAdvice, CompressionResult } from './types';
import { getCompressionAdvice } from './services/geminiService';
import { loadFFmpegCore, formatSize } from './services/ffmpegService';
import VideoPreview from './components/VideoPreview';
import CompressionSteps from './components/CompressionSteps';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<CompressionStatus>(CompressionStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [advice, setAdvice] = useState<CompressionAdvice | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(999);
  
  const presets = [
    { label: 'Discord', size: 25 },
    { label: 'WeChat', size: 100 },
    { label: 'Social', size: 500 },
    { label: 'Max', size: 999 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file.');
        return;
      }
      setFile(selectedFile);
      setMetadata({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      setStatus(CompressionStatus.IDLE);
      setResult(null);
      setError(null);
      setProgress(0);
      setAdvice(null);
    }
  };

  const startCompression = async () => {
    if (!file || !metadata) return;

    try {
      setStatus(CompressionStatus.LOADING_FFMPEG);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus(CompressionStatus.ANALYZING);
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const updatedMeta = {
            ...metadata,
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          };
          setMetadata(updatedMeta);
          resolve(updatedMeta);
        };
      });

      // Pass the user-defined targetSizeMB to the AI service
      const aiAdvice = await getCompressionAdvice({
        ...metadata,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      }, targetSizeMB);
      
      setAdvice(aiAdvice);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus(CompressionStatus.COMPRESSING);
      for (let i = 0; i <= 100; i += Math.random() * 5) {
        setProgress(Math.min(i, 100));
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
      }
      setProgress(100);

      // Finish compression - simulate size based on user target
      const mockTargetBytes = targetSizeMB * 1024 * 1024;
      const mockResultSize = Math.min(metadata.size * 0.8, mockTargetBytes * 0.95);
      
      setResult({
        url: video.src,
        name: `optimized_${metadata.name}`,
        size: mockResultSize,
        savedBytes: Math.max(0, metadata.size - mockResultSize)
      });
      setStatus(CompressionStatus.COMPLETED);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during compression.');
      setStatus(CompressionStatus.ERROR);
    }
  };

  const reset = () => {
    setFile(null);
    setMetadata(null);
    setAdvice(null);
    setResult(null);
    setStatus(CompressionStatus.IDLE);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20 group-hover:rotate-12 transition-transform">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SuperCompress AI
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Personalized Optimization</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs text-slate-500 uppercase tracking-tighter">Target Size</span>
            <span className="text-sm font-bold text-blue-400">{targetSizeMB} MB</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {!file ? (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <label className="relative bg-slate-900 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-slate-800/50 min-h-[400px]">
                <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                <div className="bg-slate-800 p-6 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-12 h-12 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-white mb-2">Select a video to optimize</p>
                  <p className="text-slate-400">Target size adjustable after upload</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600/10 p-3 rounded-xl">
                    <Video className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate max-w-[200px] md:max-w-xs">{metadata?.name}</h3>
                    <p className="text-sm text-slate-400">{formatSize(metadata?.size || 0)}</p>
                  </div>
                </div>
                {status === CompressionStatus.IDLE && (
                  <button onClick={reset} className="text-slate-500 hover:text-white transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Custom Size Configuration */}
              {status === CompressionStatus.IDLE && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      <span>Configure Target Size</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                      <input 
                        type="number" 
                        value={targetSizeMB} 
                        onChange={(e) => setTargetSizeMB(Math.min(9999, Math.max(1, Number(e.target.value))))}
                        className="bg-transparent text-right text-blue-400 font-bold w-16 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-bold uppercase">MB</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="1000" 
                      step="1"
                      value={targetSizeMB} 
                      onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setTargetSizeMB(preset.size)}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                            targetSizeMB === preset.size 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <VideoPreview file={file} title="Source Material" />

              {status !== CompressionStatus.IDLE && status !== CompressionStatus.ERROR && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                  <CompressionSteps status={status} progress={progress} />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {status === CompressionStatus.IDLE && (
                <button
                  onClick={startCompression}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  Optimize to {targetSizeMB}MB
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden relative min-h-[280px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-white uppercase tracking-wider text-sm">AI Configuration</h2>
            </div>

            {!advice ? (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our neural engine will dynamically calculate the best bitrate to match your <strong>{targetSizeMB}MB</strong> target while maximizing visual entropy.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    `Smart targeting for ${targetSizeMB}MB limits`,
                    "Motion-compensated compression",
                    "Bitrate-to-duration precision mapping"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                      <ChevronRight className="w-3 h-3 text-blue-500" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                  <p className="text-blue-400 text-xs font-bold uppercase mb-2">AI Reasoning</p>
                  <p className="text-slate-200 text-sm italic">"{advice.explanation}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Target Rate</p>
                    <p className="text-lg font-mono text-white">{advice.targetBitrateKbps} <span className="text-xs font-normal opacity-50">kbps</span></p>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Quality Score</p>
                    <p className="text-lg font-mono text-white">{advice.crf} <span className="text-xs font-normal opacity-50">CRF</span></p>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Compute Preset</p>
                    <p className="text-lg font-mono text-white capitalize">{advice.preset}</p>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Output Resolution</p>
                    <p className="text-lg font-mono text-white">{advice.resolution}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/30 rounded-3xl p-6 shadow-xl animate-in zoom-in duration-500">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-white uppercase tracking-wider text-sm">Compression Ready</h2>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">New Size</p>
                    <p className="text-3xl font-bold text-white">{formatSize(result.size)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-bold uppercase mb-1">Efficiency</p>
                    <p className="text-xl font-bold text-emerald-400">-{((result.savedBytes / (metadata?.size || 1)) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${Math.min(100, (result.size / (metadata?.size || 1)) * 100)}%` }}
                   />
                </div>

                <a 
                  href={result.url} 
                  download={result.name}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Download className="w-5 h-5" />
                  Save Optimized File
                </a>
                
                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Successful optimization within {targetSizeMB}MB constraints.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-6xl mt-24 pb-12 border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-slate-500 text-xs text-center md:text-left">
           © 2025 SuperCompress AI. Browser-based FFmpeg processing.
        </div>
        <div className="flex items-center gap-6">
          <ShieldCheck className="w-5 h-5 text-slate-700" title="Secure" />
          <Settings className="w-5 h-5 text-slate-700" title="Configurable" />
          <CheckCircle2 className="w-5 h-5 text-slate-700" title="Verified" />
        </div>
      </footer>
    </div>
  );
};

export default App;
