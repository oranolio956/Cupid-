import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { TinderModel, TinderAccount, TinderDashboardView, AccountStatus } from '../types';
import { generateSimilarNames } from '../services/geminiService';
import { Button } from './Button';
import { 
  User, Plus, MapPin, Camera, Smartphone, Globe, Layers, 
  ArrowLeft, RefreshCw, Wand2, CheckCircle2, AlertCircle, 
  Clock, UploadCloud, X, Zap, Activity, Terminal, Server,
  Database, Wifi, Image as ImageIcon, MessageSquare, Trash2
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

const MOCK_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", 
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Miami, FL"
];

const PROXY_COST = 1.00;
const SMS_COST = 0.75;

export const TinderDashboard: React.FC<Props> = ({ onBack }) => {
  const [view, setView] = useState<TinderDashboardView>('list');
  const [models, setModels] = useState<TinderModel[]>([]);
  const [activeModel, setActiveModel] = useState<TinderModel | null>(null);
  
  // Creation Form State
  const [formData, setFormData] = useState<Partial<TinderModel>>({
    locationMode: 'auto',
    targetCities: [],
    funnel: {},
    photoCount: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  
  // Photo Upload State
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rinse/Deployment State
  const [deployQuantity, setDeployQuantity] = useState(5);
  const [accounts, setAccounts] = useState<TinderAccount[]>([]);
  const [isRinsing, setIsRinsing] = useState(false);
  
  // --- Handlers ---

  const handleGenerateNames = async () => {
    if (!formData.name) {
        setErrors(prev => ({ ...prev, name: "Name is required for generation" }));
        return;
    }
    setIsGeneratingNames(true);
    setErrors(prev => ({ ...prev, name: "" })); // Clear error
    const names = await generateSimilarNames(formData.name);
    setGeneratedNames(names);
    setIsGeneratingNames(false);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f: any) => f.type.startsWith('image/')) as File[];
      if (files.length > 0) processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((f: any) => f.type.startsWith('image/')) as File[];
      if (files.length > 0) processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    setUploadingPhotos(true);
    setErrors(prev => ({ ...prev, photos: "" }));
    setUploadProgress(0);

    // Create previews immediately
    const newPreviews = files.map(f => URL.createObjectURL(f));
    
    // Simulate network progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingPhotos(false);
          setUploadedPreviews(curr => [...curr, ...newPreviews]);
          setFormData(curr => ({ ...curr, photoCount: (curr.photoCount || 0) + files.length }));
          return 100;
        }
        return prev + 4; // ~1.25 seconds for visual feedback
      });
    }, 50);
  };

  const removePhoto = (index: number) => {
     setUploadedPreviews(prev => prev.filter((_, i) => i !== index));
     setFormData(prev => ({ ...prev, photoCount: Math.max(0, (prev.photoCount || 1) - 1) }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name Validation
    if (!formData.name?.trim()) newErrors.name = "Model name is required";
    else if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    
    // Age Validation
    if (!formData.age) newErrors.age = "Required";
    else if (formData.age < 18) newErrors.age = "Must be 18+";
    else if (formData.age > 80) newErrors.age = "Max age 80";
    
    // Location Validation
    if (formData.locationMode === 'manual' && (!formData.targetCities || formData.targetCities.length === 0)) {
        newErrors.location = "Select at least 1 city";
    }

    // Photo Validation
    if (!formData.photoCount || formData.photoCount === 0) {
        newErrors.photos = "Media assets are required to compile model";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveModel = () => {
    if (!validateForm()) return;

    const newModel: TinderModel = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      age: formData.age!,
      locationMode: formData.locationMode || 'auto',
      targetCities: formData.targetCities || [],
      funnel: formData.funnel || {},
      photoCount: formData.photoCount || 0,
      status: 'active'
    };
    setModels(prev => [...prev, newModel]);
    
    // Reset view state
    setUploadedPreviews([]);
    setUploadProgress(0);
    setView('list');
  };

  const startRinse = () => {
    if (!activeModel) return;
    setIsRinsing(true);
    
    // Initialize accounts
    const newAccounts: TinderAccount[] = Array.from({ length: deployQuantity }).map((_, i) => ({
      id: `acc-${Date.now()}-${i}`,
      modelId: activeModel.id,
      proxyIp: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      status: 'initializing',
      progress: 0,
      logs: [`[${new Date().toLocaleTimeString()}] Session initialized...`]
    }));
    
    setAccounts(newAccounts);

    // Simulation Loop
    const interval = setInterval(() => {
      setAccounts(currentAccs => {
        let allComplete = true;
        
        const updated = currentAccs.map(acc => {
          if (acc.status === 'warming_up') return acc; // Already done

          allComplete = false;
          let nextStatus = acc.status;
          
          // --- SPEED TUNING ---
          // Initialize (0-5%): Instant
          // Proxy (5-15%): ~10s (Fast)
          // Cleaning (15-45%): ~30s (Deterministic per photo)
          // Registering (45-85%): ~150s (Slowest, 2.5 mins, simulate real interaction)
          // SMS (85-100%): ~15s (Fast)
          
          let increment = 0;
          
          if (acc.status === 'initializing') {
              increment = 2.5; 
          } else if (acc.status === 'allocating_proxy') {
              increment = 0.8 + Math.random() * 0.4; // Avg 1.0/tick. 10 ticks = 10s.
          } else if (acc.status === 'cleaning_images') {
              increment = 0.8 + Math.random() * 0.2; // Avg 0.9/tick. 30 units / 0.9 = ~33s.
          } else if (acc.status === 'registering') {
              // 40 units of progress (45->85). Target ~150s (2.5 mins). 
              // 40 / 150 = ~0.266 per tick
              increment = 0.2 + Math.random() * 0.15; // Range: 0.2 - 0.35 (Avg 0.275) -> ~145s
          } else {
              increment = 1.0; // SMS/Finalizing
          }

          let nextProgress = acc.progress + increment;
          let newLog = null;
          const timestamp = new Date().toLocaleTimeString();

          // State Machine Thresholds
          // 1. Init -> Proxy
          if (acc.status === 'initializing' && nextProgress > 5) {
            nextStatus = 'allocating_proxy';
            newLog = `[${timestamp}] Proxy handshake init: ${acc.proxyIp}`;
          } 
          // 2. Proxy -> Cleaning
          else if (acc.status === 'allocating_proxy' && nextProgress > 15) {
            nextStatus = 'cleaning_images';
            newLog = `[${timestamp}] Connection secured. Scrubbing media EXIF...`;
          } 
          // 3. Cleaning Logic (Deterministic 1/30, 2/30...)
          else if (acc.status === 'cleaning_images') {
             // Progress range for cleaning is 15 -> 45 (30 units)
             // We have activeModel.photoCount photos (default 30 for mock)
             const totalPhotos = activeModel.photoCount || 30;
             const rangeStart = 15;
             const rangeEnd = 45;
             const rangeSize = rangeEnd - rangeStart;
             
             const currentPhotoIndex = Math.floor(((acc.progress - rangeStart) / rangeSize) * totalPhotos);
             const nextPhotoIndex = Math.floor(((nextProgress - rangeStart) / rangeSize) * totalPhotos);
             
             // If we've moved to a new photo index, log it
             if (nextPhotoIndex > currentPhotoIndex && nextPhotoIndex <= totalPhotos) {
                 newLog = `[${timestamp}] Cleaned image ${nextPhotoIndex}/${totalPhotos} (removed metadata)`;
             }

             if (nextProgress > 45) {
                nextStatus = 'registering';
                newLog = `[${timestamp}] Media prepared. Interfacing with Tinder API v3...`;
             }
          } 
          // 4. Registering -> SMS
          else if (acc.status === 'registering') {
            // Add sparse jitter logs
            if (Math.random() > 0.98) {
                newLog = `[${timestamp}] API Latency: ${Math.floor(Math.random() * 200 + 50)}ms - Filling bio...`;
            }

            if (nextProgress > 85) {
              nextStatus = 'verifying_sms';
              newLog = `[${timestamp}] Profile created. Requesting SMS verification...`;
            }
          } 
          // 5. SMS -> Active
          else if (acc.status === 'verifying_sms') {
             if (nextProgress > 95 && !acc.logs.some(l => l.includes('received'))) {
                 newLog = `[${timestamp}] SMS Code received (Provider: Verizon). Verifying...`;
             }
             if (nextProgress >= 100) {
                nextStatus = 'warming_up';
                nextProgress = 100;
                newLog = `[${timestamp}] Account active. Entering 72h warm-up cycle.`;
                acc.warmUpEndTime = Date.now() + (72 * 60 * 60 * 1000);
             }
          }

          if (nextProgress > 100) nextProgress = 100;

          return {
            ...acc,
            status: nextStatus,
            progress: nextProgress,
            logs: newLog ? [...acc.logs, newLog] : acc.logs
          };
        });

        if (allComplete) {
            // Keep interval running for countdowns
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  // --- Views ---

  const renderModelList = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Model Management</h2>
          <p className="text-zinc-500 text-sm">Manage personas and deployment configurations.</p>
        </div>
        <Button onClick={() => { 
          setFormData({ locationMode: 'auto', targetCities: [], funnel: {}, photoCount: 0 });
          setUploadedPreviews([]);
          setErrors({});
          setView('create'); 
        }} className="w-auto px-6">
          <Plus size={16} className="mr-2" /> New Model
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center bg-zinc-900/20">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <User className="text-zinc-500" size={32} />
          </div>
          <h3 className="text-white font-bold mb-2">No Models Configured</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6">
            Create a model persona to begin automating traffic. You'll need photos and funnel details ready.
          </p>
          <Button onClick={() => {
             setFormData({ locationMode: 'auto', targetCities: [], funnel: {}, photoCount: 0 });
             setUploadedPreviews([]);
             setErrors({});
             setView('create');
          }} variant="secondary" className="w-auto px-6">
            Create First Model
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => (
            <div key={model.id} className="bg-[#09090b] border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">
                     {model.name[0]}
                   </div>
                   <div>
                     <h4 className="text-white font-bold">{model.name}</h4>
                     <span className="text-xs text-zinc-500">{model.age} years old</span>
                   </div>
                </div>
                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                  Ready
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Targeting</span>
                  <span className="text-zinc-300">{model.locationMode === 'auto' ? 'Algorithmic' : `${model.targetCities.length} Cities`}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Assets</span>
                  <span className="text-zinc-300">{model.photoCount} Photos</span>
                </div>
              </div>

              <Button onClick={() => { setActiveModel(model); setView('rinse'); }} className="w-full">
                <RefreshCw size={16} className="mr-2" /> Deploy / Rinse
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreate = () => (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('list')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configure New Model</h2>
      </div>

      <div className="space-y-8">
        
        {/* Identity Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <User size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Identity Matrix</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500">Model Name <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input 
                  type="text"
                  autoComplete="off"
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-2 text-white focus:outline-none transition-all ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-rose-500'}`}
                  placeholder="e.g. Sarah"
                />
                {errors.name && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-in fade-in zoom-in">
                      <AlertCircle size={16} />
                   </div>
                )}
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500">Age <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input 
                  type="number"
                  autoComplete="off"
                  value={formData.age || ''}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, age: parseInt(e.target.value) }));
                    if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
                  }}
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-2 text-white focus:outline-none transition-all ${errors.age ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-rose-500'}`}
                  placeholder="18-80"
                />
                {errors.age && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-in fade-in zoom-in">
                      <AlertCircle size={16} />
                   </div>
                )}
              </div>
              {errors.age && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.age}</p>}
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
                variant="secondary" 
                onClick={handleGenerateNames} 
                isLoading={isGeneratingNames}
                className="text-xs py-2 h-auto"
            >
                <Wand2 size={14} className="mr-2" /> Generate 100 Variations
            </Button>
            
            {generatedNames.length > 0 && (
                <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-2">AI Suggested Aliases:</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
                        {generatedNames.map((name, i) => (
                            <button 
                                key={i} 
                                onClick={() => {
                                    setFormData(p => ({ ...p, name: name }));
                                    setErrors(p => ({ ...p, name: '' }));
                                }}
                                className="px-2 py-1 bg-black hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-300 transition-colors"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </section>

        {/* Location Section */}
        <section className="space-y-4 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <MapPin size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Geo-Targeting</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
             <button 
               onClick={() => {
                   setFormData(p => ({ ...p, locationMode: 'auto' }));
                   setErrors(p => ({ ...p, location: '' }));
               }}
               className={`p-4 rounded-xl border text-left transition-all ${formData.locationMode === 'auto' ? 'bg-rose-500/10 border-rose-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
             >
                <div className="font-bold mb-1">Algorithmic Placement</div>
                <div className="text-[10px] opacity-70">AI selects high-LTV areas automatically.</div>
             </button>
             <button 
               onClick={() => setFormData(p => ({ ...p, locationMode: 'manual' }))}
               className={`p-4 rounded-xl border text-left transition-all ${
                 formData.locationMode === 'manual' 
                   ? 'bg-rose-500/10 border-rose-500 text-white' 
                   : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
               } ${errors.location ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
             >
                <div className="font-bold mb-1">Manual Selection</div>
                <div className="text-[10px] opacity-70">Specify exact cities to target.</div>
             </button>
          </div>

          {formData.locationMode === 'manual' && (
             <div className={`bg-zinc-900 border rounded-xl p-4 max-h-48 overflow-y-auto ${errors.location ? 'border-red-500' : 'border-zinc-800'}`}>
                <div className="space-y-2">
                   {MOCK_CITIES.map(city => (
                       <label key={city} className="flex items-center gap-3 p-2 hover:bg-black/20 rounded cursor-pointer">
                          <input 
                             type="checkbox" 
                             className="accent-rose-500 w-4 h-4"
                             checked={formData.targetCities?.includes(city)}
                             onChange={(e) => {
                                 const current = formData.targetCities || [];
                                 const updated = e.target.checked 
                                     ? [...current, city]
                                     : current.filter(c => c !== city);
                                 
                                 setFormData(p => ({ ...p, targetCities: updated }));
                                 if (updated.length > 0) setErrors(p => ({ ...p, location: '' }));
                             }}
                           />
                          <span className="text-sm text-zinc-300">{city}</span>
                       </label>
                   ))}
                </div>
             </div>
          )}
          {errors.location && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.location}</p>}
        </section>

        {/* Funnel Section */}
        <section className="space-y-4 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <Layers size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Traffic Funnel</h3>
          </div>
          
          <div className="space-y-3">
             <div className="relative">
                <Smartphone className="absolute left-3 top-3 text-zinc-600" size={16} />
                <input 
                    type="text" 
                    autoComplete="off"
                    placeholder="Snapchat Username"
                    value={formData.funnel?.snapchat || ''}
                    onChange={e => setFormData(p => ({ ...p, funnel: { ...p.funnel, snapchat: e.target.value } }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-rose-500 focus:outline-none" 
                />
             </div>
             <div className="relative">
                <Camera className="absolute left-3 top-3 text-zinc-600" size={16} />
                <input 
                    type="text" 
                    autoComplete="off"
                    placeholder="Instagram Username"
                    value={formData.funnel?.instagram || ''}
                    onChange={e => setFormData(p => ({ ...p, funnel: { ...p.funnel, instagram: e.target.value } }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-rose-500 focus:outline-none" 
                />
             </div>
             <div className="relative">
                <Globe className="absolute left-3 top-3 text-zinc-600" size={16} />
                <input 
                    type="text" 
                    autoComplete="off"
                    placeholder="OnlyFans / LinkTree URL"
                    value={formData.funnel?.onlyfans || ''}
                    onChange={e => setFormData(p => ({ ...p, funnel: { ...p.funnel, onlyfans: e.target.value } }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-rose-500 focus:outline-none" 
                />
             </div>
          </div>
        </section>

        {/* Photos */}
        <section className="space-y-4 pt-6 border-t border-zinc-800">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <UploadCloud size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Media Assets <span className="text-rose-500">*</span></h3>
              </div>
              <div className="text-right">
                  <span className={`text-xs font-bold ${formData.photoCount && formData.photoCount >= 30 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                      {formData.photoCount || 0} / 30 Photos
                  </span>
              </div>
           </div>

           {/* Drop Zone */}
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
             className={`relative border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                 isDragging 
                    ? 'border-rose-500 bg-rose-500/10 scale-[1.02]' 
                    : errors.photos 
                        ? 'border-red-500/50 bg-red-500/5' 
                        : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
             }`}
           >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleFileSelect}
              />

              {uploadingPhotos ? (
                  <div className="w-full max-w-xs space-y-3 px-8 animate-in fade-in">
                      <div className="flex justify-between text-xs text-rose-500 font-bold uppercase">
                          <span>Encrypting Assets...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-rose-500 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                             style={{ width: `${uploadProgress}%` }} 
                          />
                      </div>
                  </div>
              ) : (
                  <>
                    <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                        <UploadCloud size={24} />
                    </div>
                    <div className="text-center">
                        <span className={`text-sm font-medium block transition-colors ${isDragging ? 'text-white' : 'text-zinc-300'}`}>
                            {isDragging ? 'Drop Files Here' : 'Click or Drag to Upload'}
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                            Supports JPG, PNG, HEIC (Max 50MB)
                        </span>
                    </div>
                  </>
              )}
           </div>
            
           {/* Thumbnails Grid */}
           {uploadedPreviews.length > 0 && (
               <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 animate-in fade-in slide-in-from-bottom-2">
                   {uploadedPreviews.map((src, idx) => (
                       <div key={idx} className="aspect-square relative group rounded-lg overflow-hidden border border-zinc-800 bg-black">
                           <img src={src} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button 
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     removePhoto(idx);
                                 }}
                                 className="p-1.5 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all scale-90 hover:scale-100"
                               >
                                   <Trash2 size={16} />
                               </button>
                           </div>
                       </div>
                   ))}
                   {/* Quick Add Button */}
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="aspect-square rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 hover:text-white transition-colors gap-1 group"
                   >
                       <Plus size={20} className="group-hover:scale-110 transition-transform" />
                       <span className="text-[9px] font-bold uppercase">Add</span>
                   </button>
               </div>
           )}
           
           {/* Error Message */}
           {errors.photos && (
               <div className="flex items-center gap-2 text-red-400 text-xs mt-2 animate-in fade-in slide-in-from-left-1">
                   <AlertCircle size={14} />
                   <span>{errors.photos}</span>
               </div>
           )}
        </section>

        <div className="pt-8 flex gap-4">
           <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
           <Button onClick={saveModel}>Save & Compile Model</Button>
        </div>
      </div>
    </div>
  );

  const renderRinse = () => {
    if (!activeModel) return null;
    const totalCost = deployQuantity * (PROXY_COST + SMS_COST);

    // Calculate aggregated stats for visualizer
    const totalProgress = accounts.length > 0 
        ? accounts.reduce((acc, curr) => acc + curr.progress, 0) / accounts.length 
        : 0;

    // Remaining time estimation (mock logic: assume 1% takes ~1s average, remaining % * 1s)
    const estSecondsLeft = Math.ceil((100 - totalProgress) * 1.5);
    const estTimeDisplay = estSecondsLeft > 60 
        ? `${Math.ceil(estSecondsLeft / 60)}m ${estSecondsLeft % 60}s` 
        : `${estSecondsLeft}s`;

    const activeStages = {
        init: accounts.filter(a => a.status === 'initializing').length,
        proxy: accounts.filter(a => a.status === 'allocating_proxy').length,
        media: accounts.filter(a => a.status === 'cleaning_images').length,
        api: accounts.filter(a => a.status === 'registering').length,
        sms: accounts.filter(a => a.status === 'verifying_sms').length,
        done: accounts.filter(a => a.status === 'warming_up').length,
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Rinse Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                           {activeModel.name} <span className="text-rose-600">::</span> Rinse Dashboard
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                             <span className="text-xs font-mono text-emerald-500 flex items-center gap-1">
                                 <Activity size={12} /> System Ready
                             </span>
                             <span className="text-xs text-zinc-500">|</span>
                             <span className="text-xs text-zinc-500">Funnel: {activeModel.funnel.onlyfans || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                {accounts.length > 0 && (
                     <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg hidden sm:flex">
                        <div className="text-right">
                           <div className="text-[10px] text-zinc-500 uppercase font-bold">Active Processes</div>
                           <div className="text-lg font-mono font-bold text-white leading-none">{accounts.length}</div>
                        </div>
                        <Activity className="text-rose-500 animate-pulse" />
                     </div>
                )}
            </div>

            {accounts.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
                    <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                         <h3 className="text-xl font-bold text-white mb-6">Mass Deployment Configuration</h3>
                         
                         <div className="space-y-8">
                             <div className="space-y-4">
                                <div className="flex justify-between">
                                   <label className="text-sm font-bold text-zinc-400">Account Volume</label>
                                   <span className="text-sm font-mono font-bold text-white">{deployQuantity} Units</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="50" 
                                  value={deployQuantity}
                                  onChange={(e) => setDeployQuantity(parseInt(e.target.value))}
                                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                />
                             </div>

                             <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-3">
                                 <div className="flex justify-between text-sm">
                                     <span className="text-zinc-500">4G Mobile Proxies ({deployQuantity}x)</span>
                                     <span className="font-mono text-zinc-300">${(deployQuantity * PROXY_COST).toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                     <span className="text-zinc-500">Non-VoIP SMS ({deployQuantity}x)</span>
                                     <span className="font-mono text-zinc-300">${(deployQuantity * SMS_COST).toFixed(2)}</span>
                                 </div>
                                 <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
                                     <span className="font-bold text-white">Total Estimated Cost</span>
                                     <span className="font-mono font-bold text-rose-500 text-lg">${totalCost.toFixed(2)}</span>
                                 </div>
                             </div>

                             <Button onClick={startRinse} className="w-full py-4 text-base shadow-rose-900/40">
                                 Initialize Deployment Sequence
                             </Button>
                             
                             <p className="text-[10px] text-center text-zinc-600">
                                By proceeding, you authorize the automated creation of accounts. 
                                Estimated time: ~10 minutes per batch.
                             </p>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2">
                    
                    {/* Deployment Pipeline Visualization */}
                    <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 mb-6 shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-end mb-4 relative z-10">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Layers size={14} className="text-rose-500" /> Deployment Pipeline
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">Real-time queue orchestration status.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-mono font-bold text-white">{Math.round(totalProgress)}%</div>
                                <div className="text-[10px] text-zinc-500 font-mono">EST: {estTimeDisplay}</div>
                            </div>
                        </div>

                        {/* Pipeline Stages */}
                        <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                            {[
                                { id: 'init', label: 'Init', icon: Terminal, count: activeStages.init, color: 'text-zinc-400' },
                                { id: 'proxy', label: 'Proxy', icon: Wifi, count: activeStages.proxy, color: 'text-indigo-400' },
                                { id: 'media', label: 'Media', icon: ImageIcon, count: activeStages.media, color: 'text-pink-400' },
                                { id: 'api', label: 'API', icon: Server, count: activeStages.api, color: 'text-rose-400' },
                                { id: 'sms', label: 'SMS', icon: MessageSquare, count: activeStages.sms, color: 'text-yellow-400' },
                                { id: 'done', label: 'Active', icon: CheckCircle2, count: activeStages.done, color: 'text-emerald-400' },
                            ].map((stage, idx, arr) => (
                                <div key={stage.id} className="flex-1 flex flex-col items-center gap-2 relative">
                                    {/* Connector Line */}
                                    {idx !== arr.length - 1 && (
                                        <div className="absolute top-3.5 left-1/2 w-full h-0.5 bg-zinc-800 -z-10" />
                                    )}
                                    
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border bg-[#09090b] z-20 transition-all duration-300 ${stage.count > 0 ? `${stage.color} border-current shadow-[0_0_10px_rgba(0,0,0,0.5)]` : 'text-zinc-700 border-zinc-800'}`}>
                                        <stage.icon size={12} />
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-[10px] font-bold ${stage.count > 0 ? 'text-white' : 'text-zinc-600'}`}>{stage.label}</div>
                                        <div className={`text-[9px] font-mono ${stage.count > 0 ? stage.color : 'text-zinc-700'}`}>{stage.count}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-900">
                             <div 
                                className="h-full bg-gradient-to-r from-rose-600 to-indigo-600 transition-all duration-500 ease-out" 
                                style={{ width: `${totalProgress}%` }}
                             />
                        </div>
                    </div>

                    {/* Account Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.map((acc) => (
                            <AccountCard key={acc.id} account={acc} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-[#050505] z-40 flex flex-col">
       {/* Top Bar */}
       {view === 'list' && (
          <div className="h-16 border-b border-zinc-800 bg-[#09090b]/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
              <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                  <ArrowLeft size={16} />
                  <span className="text-sm font-medium">Back to Apps</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-rose-500 hidden sm:inline">OFM Automation Suite</span>
                  <span className="text-xs font-bold text-rose-500 sm:hidden">OFM</span>
              </div>
          </div>
       )}

       <div className="flex-1 overflow-y-auto p-6 md:p-8">
           {view === 'list' && renderModelList()}
           {view === 'create' && renderCreate()}
           {view === 'rinse' && renderRinse()}
       </div>
    </div>
  );
};

// --- Sub-Components ---

const AccountCard: React.FC<{ account: TinderAccount }> = ({ account }) => {
    // Countdown Hook logic inside
    const [timeLeft, setTimeLeft] = useState("");
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic: Sets scrollTop to scrollHeight (bottom)
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [account.logs]);
    
    useEffect(() => {
        if (account.status !== 'warming_up' || !account.warmUpEndTime) return;
        
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = account.warmUpEndTime! - now;
            
            if (diff <= 0) {
                setTimeLeft("Ready");
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);
        
        return () => clearInterval(timer);
    }, [account.status, account.warmUpEndTime]);

    const getStatusColor = (s: AccountStatus) => {
        if (s === 'warming_up') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (s === 'active') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    // Syntax Highlighting Helper
    const formatLog = (logStr: string, index: number) => {
        const match = logStr.match(/^(\[.*?\])\s*(.*)$/);
        
        // Fallback if format doesn't match
        if (!match) {
            return (
                <div key={index} className="truncate animate-in fade-in slide-in-from-left-2 duration-300 text-zinc-500">
                    {logStr}
                </div>
            );
        }

        const timestamp = match[1];
        const content = match[2];

        // Define highlights
        const highlights: Record<string, string> = {
            'API': 'text-rose-400 font-bold',
            'Proxy': 'text-indigo-400',
            'Media': 'text-pink-400',
            'Cleaned': 'text-pink-400',
            'SMS': 'text-amber-400',
            'Code': 'text-amber-400 font-bold',
            'Verizon': 'text-amber-400',
            'Latency': 'text-orange-400',
            'Error': 'text-red-500 font-bold',
            'Success': 'text-emerald-500',
            'active': 'text-emerald-500',
            'Profile': 'text-zinc-300 font-bold',
        };

        // Regex to match keywords
        const regex = new RegExp(`(${Object.keys(highlights).join('|')})`, 'g');
        const parts = content.split(regex);

        return (
            <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 w-full">
                <span className="text-[9px] text-zinc-600 font-mono opacity-70 shrink-0">{timestamp}</span>
                <span className="truncate text-zinc-400">
                    {parts.map((part, i) => {
                        const style = highlights[part];
                        return style ? <span key={i} className={style}>{part}</span> : part;
                    })}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-xl flex flex-col gap-3 shadow-lg">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-zinc-600" />
                    <span className="font-mono text-xs text-zinc-400">{account.id.split('-')[2]}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${getStatusColor(account.status)}`}>
                    {account.status === 'warming_up' ? <Clock size={10} /> : <Zap size={10} />}
                    {account.status.replace('_', ' ')}
                </div>
            </div>

            <div 
                ref={logsContainerRef}
                className="h-32 bg-black border border-zinc-900 rounded-lg p-3 overflow-y-auto font-mono text-[10px] space-y-1 no-scrollbar relative scroll-smooth shadow-inner"
            >
                {account.logs.map((log, i) => formatLog(log, i))}
            </div>

            {account.status === 'warming_up' ? (
                <div className="mt-auto pt-2 border-t border-zinc-800">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Warm Up Timer</span>
                        <span className="text-sm font-mono font-bold text-amber-500">{timeLeft}</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 mt-auto">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Progress</span>
                        <span>{Math.round(account.progress)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${account.progress}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
};