import * as React from 'react';
import { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { DependencyModal } from './components/DependencyModal';
import { TinderDashboard } from './components/TinderDashboard';
import { DatingApp, ViewState } from './types';
import { TinderIcon, BumbleIcon, HingeIcon, OkCupidIcon, GrindrIcon } from './components/BrandIcons';
import { 
  Activity, 
  Settings, 
  LogOut, 
  LayoutGrid, 
  Cpu, 
  Wifi, 
  Lock, 
  Globe,
  Wallet,
  Smartphone,
  ChevronRight,
  User,
  Clock,
  X,
  Plus,
  CheckCircle2,
  Copy,
  QrCode,
  ArrowDownLeft,
  History,
  Link,
  Bell,
  HelpCircle,
  FileText,
  BarChart3,
  Signal,
  Zap,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Server,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Key,
  Loader2
} from 'lucide-react';

// --- Constants ---
const DATING_APPS: DatingApp[] = [
  { 
    id: 'tinder', 
    name: 'Tinder', 
    iconColor: 'bg-gradient-to-br from-rose-500 to-pink-600', 
    secondaryColor: 'text-white', 
    description: 'v3.2.0 • Low Latency',
    status: 'active'
  },
  { 
    id: 'bumble', 
    name: 'Bumble', 
    iconColor: 'bg-[#FFC629]', 
    secondaryColor: 'text-white',
    description: 'Premium API • Locked',
    status: 'premium_only'
  },
  { 
    id: 'hinge', 
    name: 'Hinge', 
    iconColor: 'bg-black', 
    secondaryColor: 'text-white',
    description: 'Maintenance Mode',
    status: 'coming_soon'
  },
  { 
    id: 'okcupid', 
    name: 'OkCupid', 
    iconColor: 'bg-blue-600', 
    secondaryColor: 'text-white',
    description: 'Legacy • v1.5.4',
    status: 'coming_soon'
  },
  { 
    id: 'grindr', 
    name: 'Grindr', 
    iconColor: 'bg-orange-500', 
    secondaryColor: 'text-white',
    description: 'Beta Access Only',
    status: 'coming_soon'
  },
];

const CRYPTO_OPTIONS = [
  { id: 'USDT', name: 'Tether (TRC20)', symbol: 'USDT', color: 'text-emerald-500', bg: 'bg-emerald-500/10', address: 'TEQQ...8J2', network: 'TRON' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', color: 'text-purple-500', bg: 'bg-purple-500/10', address: '83K...9L2', network: 'Solana' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', color: 'text-indigo-400', bg: 'bg-indigo-500/10', address: '0x71...C9', network: 'ERC20' },
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-500', bg: 'bg-orange-500/10', address: 'bc1q...92', network: 'Bitcoin' },
  { id: 'LTC', name: 'Litecoin', symbol: 'LTC', color: 'text-zinc-300', bg: 'bg-zinc-500/10', address: 'LQt...88', network: 'Litecoin' },
];

const WALLET_PROVIDERS = [
  { id: 'metamask', name: 'MetaMask', color: 'bg-orange-500', letter: 'M' },
  { id: 'coinbase', name: 'Coinbase Wallet', color: 'bg-blue-600', letter: 'C' },
  { id: 'phantom', name: 'Phantom', color: 'bg-purple-500', letter: 'P' },
  { id: 'trust', name: 'Trust Wallet', color: 'bg-cyan-500', letter: 'T' },
  { id: 'walletconnect', name: 'WalletConnect', color: 'bg-indigo-500', letter: 'W' }
];

const SUBSCRIPTION_PLANS = [
  { id: 'weekly', name: 'Weekly Access', price: 49, period: '7 Days', savings: null },
  { id: 'monthly', name: 'Monthly Pro', price: 149, period: '30 Days', savings: 'Save 25%' },
  { id: 'lifetime', name: 'Lifetime Key', price: 999, period: 'Forever', savings: 'Best Value' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [email, setEmail] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DatingApp | null>(null);
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);
  
  // Login Specific State
  const [loginStatus, setLoginStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [loginStatusText, setLoginStatusText] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'plan' | 'crypto' | 'verifying' | 'success'>('plan');
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const [generatedKey, setGeneratedKey] = useState('');

  // Tinder Dashboard Specific State
  const [showTinderDashboard, setShowTinderDashboard] = useState(false);
  
  // Wallet & Settings State
  const [balance, setBalance] = useState(0.00);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(CRYPTO_OPTIONS[0]);
  const [proxiesOwned, setProxiesOwned] = useState(0);
  const [numbersOwned, setNumbersOwned] = useState(0);
  const [copied, setCopied] = useState(false);

  // --- Security & Anti-Tamper ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Standard console warning
    console.log('%c STOP ', 'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px black;');
    console.log('%c This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam.', 'font-size: 16px;');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- Handlers ---

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStatus !== 'idle') return;

    setLoginError('');
    setLoginStatus('processing');
    
    // Simulate standard SaaS authentication sequence
    const sequence = [
        { text: "Connecting...", delay: 600 },
        { text: "Verifying credentials...", delay: 800 },
        { text: "Checking license...", delay: 700 },
        { text: "Logging in...", delay: 500 },
    ];

    for (const step of sequence) {
        setLoginStatusText(step.text);
        await new Promise(r => setTimeout(r, step.delay));
    }

    // Basic validation
    if (activationCode.replace(/\D/g, '').length >= 4 && email.includes('@')) { 
        setLoginStatusText("Success");
        setLoginStatus('success');
        await new Promise(r => setTimeout(r, 800));
        setView('dashboard');
    } else {
        setLoginError("Invalid email or license key. Please check your credentials.");
        setLoginStatus('idle');
        setLoginStatusText('');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    setActivationCode(val);
  };

  const formatDisplayCode = (code: string) => {
    return code.match(/.{1,4}/g)?.join(' ') || code;
  };

  const handleAppSelect = async (app: DatingApp) => {
    if (app.status === 'coming_soon' || app.status === 'premium_only') return;
    if (loadingAppId) return;

    // Balance Check
    if (balance < 5.00) {
        if (window.confirm(`Insufficient Balance.\n\nAutomated operations require a minimum balance of $5.00 to cover proxy and carrier fees.\n\nCurrent Balance: $${balance.toFixed(2)}\n\nWould you like to go to Settings to top up?`)) {
            setView('settings');
        }
        return;
    }
    
    setLoadingAppId(app.id);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoadingAppId(null);
    
    // Special handling for Tinder to open custom Dashboard
    if (app.id === 'tinder') {
        setShowTinderDashboard(true);
    } else {
        setSelectedApp(app);
    }
  };

  const handleCopyAddress = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateDeposit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setBalance(prev => prev + 50.00); 
      setIsLoading(false);
      setShowDepositModal(false);
    }, 2000);
  };

  const handleConnectWallet = () => {
    setIsLoading(true);
    setTimeout(() => {
      setWalletConnected(true);
      setShowWalletModal(false);
      setIsLoading(false);
    }, 1500);
  };

  const purchaseItem = (cost: number, type: 'proxy' | 'number') => {
    if (balance >= cost) {
      setBalance(prev => Number((prev - cost).toFixed(2)));
      if (type === 'proxy') setProxiesOwned(p => p + 1);
      if (type === 'number') setNumbersOwned(n => n + 1);
    } else {
      alert("Insufficient balance. Please deposit funds.");
    }
  };

  // Purchase Flow Handlers
  const handleVerifyPurchase = () => {
    setPurchaseStep('verifying');
    setTimeout(() => {
      // Generate a fake key
      const key = `CUPID-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setGeneratedKey(key);
      setPurchaseStep('success');
    }, 4000); // Fake blockchain wait time
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setPurchaseStep('plan');
    if (generatedKey) {
        setActivationCode(generatedKey);
    }
  };

  // --- Views ---

  const renderLogin = () => (
    <div className="h-screen bg-[#050505] flex flex-col relative overflow-hidden font-sans text-zinc-200">
      {/* Background Decor - Subtle & Professional */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#050505] to-[#050505] pointer-events-none z-0" />
      
      {/* Scrollable Container */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center p-6 md:p-8">
            
            {/* Login Container */}
            <div className="w-full max-w-[420px] mx-auto">
                
                {/* Brand Header */}
                <div className="mb-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-6">
                        <Logo size="lg" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Welcome back
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Enter your email and license key to access your dashboard.
                    </p>
                </div>

                <form onSubmit={handleActivation} className="space-y-6">
                    <div className="space-y-5">
                        {/* Email Field */}
                        <div className="group space-y-1.5">
                            <label className="text-sm font-medium text-zinc-400">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    autoComplete="email"
                                    disabled={loginStatus !== 'idle'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-zinc-600 disabled:opacity-50 text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Key Field */}
                        <div className="group space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-zinc-400">License Key</label>
                                <button type="button" onClick={() => alert('Please check your email for your license key.')} className="text-xs text-rose-500 hover:text-rose-400 transition-colors font-medium">
                                    Lost key?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input 
                                    type="text" 
                                    required
                                    autoComplete="off"
                                    disabled={loginStatus !== 'idle'}
                                    value={formatDisplayCode(activationCode)}
                                    onChange={handleCodeChange}
                                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white font-mono text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-zinc-600 disabled:opacity-50"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {loginError && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-xs text-red-400 font-medium">{loginError}</p>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="pt-2 space-y-4">
                        {loginStatus === 'idle' ? (
                            <Button type="submit" className="h-12 text-sm font-medium shadow-rose-900/20 hover:shadow-rose-900/40 transition-all">
                                Sign In
                            </Button>
                        ) : (
                            <div className="h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center gap-3 relative overflow-hidden">
                                {loginStatus === 'success' ? (
                                    <div className="flex items-center gap-2 text-emerald-500 animate-in zoom-in">
                                        <ShieldCheck size={18} />
                                        <span className="font-medium text-sm">Authorized</span>
                                    </div>
                                ) : (
                                    <>
                                        <Loader2 size={18} className="animate-spin text-zinc-500" />
                                        <span className="text-sm font-medium text-zinc-400">{loginStatusText}</span>
                                    </>
                                )}
                            </div>
                        )}
                        
                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => { setShowPurchaseModal(true); setPurchaseStep('plan'); }}
                                className="text-xs text-zinc-500 hover:text-white transition-colors"
                            >
                                Don't have a license? <span className="text-rose-500 hover:underline">Purchase Access</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer / Trust */}
                <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
                    <p>&copy; 2024 CupidBot Inc.</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <Lock size={10} />
                            <span>Secure Connection</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={10} />
                            <span>Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="p-2.5 bg-zinc-900/50 border border-white/5 hover:bg-white/5 rounded-full transition-all group">
            <ChevronRight className="rotate-180 w-5 h-5 text-zinc-400 group-hover:text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Account & Finance</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Manage your balance and automation resources.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity */}
        <div className="space-y-6">
          <div className="bg-[#09090b] border border-white/5 rounded-2xl p-1 overflow-hidden shadow-lg">
            <div className="p-5 bg-gradient-to-b from-zinc-900/80 to-transparent space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">John Doe</h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                    <span>ID: 884-299-XK</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span>Basic Tier</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Account Status</span>
                  <div className="flex items-center gap-1.5 text-zinc-200 px-2 py-0.5 rounded text-xs font-medium">
                     Active
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-zinc-400">Email</span>
                   <span className="text-zinc-200 text-xs font-medium">johndoe@example.com</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-500/5 border-t border-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                 <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide">Trial: 7 Days Remaining</h4>
                   <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                     Please ensure your wallet is funded to maintain service continuity after the trial period.
                   </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Finance */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Balance Card - "The Exchange Look" */}
          <div className="bg-[#09090b] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />

            <div className="relative z-10">
               <div className="flex justify-between items-start">
                 <div>
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Total Balance (USD)</span>
                    <div className="flex items-baseline gap-2 mt-2 mb-6">
                        <span className="text-5xl font-bold text-white tracking-tight">${balance.toFixed(2)}</span>
                        {walletConnected && (
                            <div className="ml-2 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded border border-emerald-500/20 flex items-center gap-1">
                                <Link size={10} /> Connected
                            </div>
                        )}
                    </div>
                 </div>
                 <div className="bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <Wallet className="text-zinc-400" size={24} />
                 </div>
               </div>

               <div className="flex flex-wrap gap-3">
                 {!walletConnected && (
                    <Button onClick={() => setShowWalletModal(true)} className="w-auto px-6 bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20">
                        <Link size={16} className="mr-2" /> Connect Wallet
                    </Button>
                 )}
                 <Button onClick={() => setShowDepositModal(true)} className="w-auto px-6 bg-white text-black hover:bg-zinc-200 border-none">
                    <ArrowDownLeft size={16} className="mr-2" /> Deposit Funds
                 </Button>
                 <Button variant="secondary" className="w-auto px-6 border-zinc-700 hover:border-zinc-500" onClick={() => alert("Withdrawals available after 30 days of account activity.")}>
                    Withdraw
                 </Button>
               </div>
            </div>
          </div>

          {/* Resources / Shop */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                 <Zap size={16} className="text-amber-500" />
                 Resource Allocation
               </h3>
               <span className="text-xs text-zinc-500 font-mono">Status: Online</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Proxy Card */}
               <div className="group bg-zinc-900/20 border border-white/5 rounded-xl p-5 hover:bg-zinc-900/40 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                       <Globe size={20} />
                     </div>
                     <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-white/5">QTY: {proxiesOwned}</span>
                  </div>
                  <h4 className="font-bold text-zinc-200">Residential Proxies</h4>
                  <p className="text-xs text-zinc-500 mt-1 mb-6">High-anonymity IP rotation nodes.</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="font-bold text-white font-mono">$1.00 <span className="text-zinc-600 text-[10px] font-sans">/ unit</span></span>
                    <button onClick={() => purchaseItem(1.00, 'proxy')} className="text-xs font-bold bg-zinc-100 hover:bg-white text-black px-3 py-1.5 rounded-lg transition-colors border border-transparent">
                      Provision
                    </button>
                  </div>
               </div>

               {/* Phone Number Card */}
               <div className="group bg-zinc-900/20 border border-white/5 rounded-xl p-5 hover:bg-zinc-900/40 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                       <Smartphone size={20} />
                     </div>
                     <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-white/5">QTY: {numbersOwned}</span>
                  </div>
                  <h4 className="font-bold text-zinc-200">SMS Uplinks</h4>
                  <p className="text-xs text-zinc-500 mt-1 mb-6">Dedicated SIM verification endpoints.</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="font-bold text-white font-mono">$0.10 <span className="text-zinc-600 text-[10px] font-sans">/ unit</span></span>
                    <button onClick={() => purchaseItem(0.10, 'number')} className="text-xs font-bold bg-zinc-100 hover:bg-white text-black px-3 py-1.5 rounded-lg transition-colors border border-transparent">
                      Provision
                    </button>
                  </div>
               </div>
             </div>
          </div>
          
          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center gap-2 text-zinc-500 mb-4">
               <History size={16} />
               <span className="text-xs font-bold uppercase tracking-wider">Recent Activity</span>
             </div>
             <div className="text-center py-12 bg-zinc-900/20 rounded-xl border border-white/5 border-dashed">
               <span className="text-xs text-zinc-600 font-medium">No transactions recorded in the current period.</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );

  // --- Main Return ---

  if (view === 'login') {
      return (
        <div className="relative">
            {renderLogin()}
            {showPurchaseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-[95%] max-w-lg max-h-[90vh] overflow-y-auto bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl ring-1 ring-white/10 flex flex-col">
                        
                        <div className="p-6 border-b border-white/5 bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Purchase License</h3>
                                <p className="text-xs text-zinc-500">Secure, anonymous crypto checkout.</p>
                            </div>
                            <button onClick={closePurchaseModal} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* Step 1: Select Plan */}
                            {purchaseStep === 'plan' && (
                                <div className="space-y-4">
                                    {SUBSCRIPTION_PLANS.map(plan => (
                                        <div 
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPlan.id === plan.id ? 'bg-rose-500/10 border-rose-500' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className={`font-bold ${selectedPlan.id === plan.id ? 'text-white' : 'text-zinc-300'}`}>{plan.name}</h4>
                                                    <div className="text-xs text-zinc-500 mt-1">{plan.period} access • Full features</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-mono font-bold text-white">${plan.price}</div>
                                                    {plan.savings && <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-1">{plan.savings}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button onClick={() => setPurchaseStep('crypto')} className="mt-4">
                                        Proceed to Payment (${selectedPlan.price})
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Payment */}
                            {(purchaseStep === 'crypto' || purchaseStep === 'verifying') && (
                                <div className="space-y-6">
                                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
                                        {CRYPTO_OPTIONS.slice(0,4).map((coin) => (
                                            <button 
                                            key={coin.id}
                                            onClick={() => { setSelectedCoin(coin); setCopied(false); }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap transition-all ${
                                                selectedCoin.id === coin.id 
                                                ? 'bg-white text-black border-white shadow-lg' 
                                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                                            }`}
                                            >
                                            <div className={`w-1.5 h-1.5 rounded-full ${coin.id === selectedCoin.id ? 'bg-black' : coin.color.replace('text-', 'bg-')}`} />
                                            {coin.symbol}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-center space-y-4">
                                        <div className="mx-auto w-48 h-48 bg-white p-2 rounded-xl">
                                            <div className="w-full h-full border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center bg-zinc-50">
                                            <QrCode size={100} className="text-black" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-2 font-mono">Send exactly <strong className="text-white">${selectedPlan.price}.00</strong> worth of {selectedCoin.symbol}</p>
                                            <div 
                                                onClick={handleCopyAddress}
                                                className="bg-black border border-zinc-800 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-zinc-700 group"
                                            >
                                                <code className="text-xs text-zinc-400 truncate mr-4">{selectedCoin.address}</code>
                                                {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-600 group-hover:text-zinc-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    {purchaseStep === 'verifying' ? (
                                        <Button disabled className="bg-zinc-800 text-zinc-400 border-zinc-700">
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Scanning Blockchain...
                                        </Button>
                                    ) : (
                                        <Button onClick={handleVerifyPurchase} className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50">
                                            I Have Sent the Payment
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {purchaseStep === 'success' && (
                                <div className="text-center space-y-6 py-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                        <CheckCircle2 size={32} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">Payment Confirmed</h4>
                                        <p className="text-sm text-zinc-400 mt-1">Your license key has been generated.</p>
                                    </div>

                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Your License Key</p>
                                        <div className="font-mono text-lg text-rose-500 font-bold break-all select-all">
                                            {generatedKey}
                                        </div>
                                    </div>

                                    <Button onClick={closePurchaseModal}>
                                        Copy & Login
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  if (showTinderDashboard) {
      return <TinderDashboard onBack={() => setShowTinderDashboard(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      
      {/* 1. Sidebar */}
      <div className="w-[280px] bg-[#09090b] border-r border-white/5 flex flex-col hidden md:flex shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
           <Logo size="sm" />
        </div>

        <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {/* Main Nav */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-3">Platform</div>
            <NavPacket active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutGrid size={18} />} label="Command Center" />
            <NavPacket icon={<Activity size={18} />} label="Live Analytics" badge="• Live" badgeColor="text-emerald-500" />
            <NavPacket icon={<BarChart3 size={18} />} label="Performance" />
          </div>

          {/* Configuration */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-3">Configuration</div>
            <NavPacket icon={<Cpu size={18} />} label="AI Behavior" />
            <NavPacket icon={<Settings size={18} />} label="Security Protocols" />
            <NavPacket active={view === 'settings'} onClick={() => setView('settings')} icon={<Wallet size={18} />} label="Finance & Billing" />
          </div>

           {/* Support */}
           <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-3">Support</div>
            <NavPacket icon={<FileText size={18} />} label="Documentation" />
            <NavPacket icon={<HelpCircle size={18} />} label="Contact Support" />
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs border border-white/10 text-zinc-300">
                JD
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-white">John Doe</div>
              <div className="text-[10px] text-zinc-500 truncate uppercase tracking-wider">Enterprise Plan</div>
            </div>
            <button onClick={() => setView('login')} className="p-2 text-zinc-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        
        {/* Desktop Top Bar */}
        <div className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-sm sticky top-0 z-10">
           <div className="flex items-center gap-2 text-sm text-zinc-500">
             <span>Platform</span>
             <ChevronRight size={14} />
             <span className="text-white font-medium">{view === 'settings' ? 'Settings' : 'Dashboard'}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="h-4 w-[1px] bg-zinc-800" />
              <button className="relative text-zinc-400 hover:text-white transition-colors">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#09090b] translate-x-1 -translate-y-0.5"></span>
              </button>
           </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#09090b] sticky top-0 z-10">
           <Logo size="sm" />
           <button onClick={() => setView('settings')} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
             <Settings size={18} />
           </button>
        </div>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto">
           {view === 'settings' ? renderSettings() : (
             <div className="p-4 md:p-8 space-y-8 pb-20 md:pb-8 animate-in fade-in duration-500">
               
               {/* Dashboard Header */}
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                  <p className="text-sm text-zinc-500 mt-1">Real-time overview of your automation infrastructure.</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="secondary" className="w-auto px-4 py-2 h-9 text-xs">
                      Export Report
                   </Button>
                   <Button className="w-auto px-4 py-2 h-9 text-xs bg-white text-black hover:bg-zinc-200 border-none">
                      <Plus size={14} className="mr-2" /> New Instance
                   </Button>
                </div>
               </div>

               {/* Stats Row - LEGIT OVERHAUL */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Network Latency */}
                  <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Latency</span>
                        </div>
                        <Signal size={16} className="text-zinc-600" />
                     </div>
                     <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-3xl font-mono font-bold text-white tracking-tighter">42</span>
                        <span className="text-xs font-mono text-zinc-500">ms</span>
                     </div>
                     <div className="mt-2 flex items-center gap-2 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Optimal</span>
                     </div>
                     {/* Deco Line */}
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-50" />
                  </div>

                  {/* Requests Per Minute */}
                  <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Throughput</span>
                        <Activity size={16} className="text-rose-500" />
                     </div>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-bold text-white tracking-tighter">842</span>
                        <span className="text-xs font-mono text-zinc-500">RPM</span>
                     </div>
                     <div className="mt-2 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                        <div className="h-full w-[20%] bg-rose-900/40" />
                        <div className="h-full w-[30%] bg-rose-800/60" />
                        <div className="h-full w-[40%] bg-rose-600" />
                     </div>
                  </div>

                  {/* Success Rate */}
                  <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Success Rate</span>
                        <MousePointerClick size={16} className="text-indigo-500" />
                     </div>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-bold text-white tracking-tighter">94.2</span>
                        <span className="text-xs font-mono text-zinc-500">%</span>
                     </div>
                     <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">24H AVG</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Top 5%</span>
                     </div>
                  </div>

                  {/* Est Yield */}
                  <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Est. Yield</span>
                        <DollarSign size={16} className="text-amber-500" />
                     </div>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-bold text-white tracking-tighter">$2.4k</span>
                        <span className="text-xs font-mono text-zinc-500">/mo</span>
                     </div>
                     <div className="mt-2 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase">
                        <TrendingUp size={10} />
                        <span>+12.4% vs prev</span>
                     </div>
                  </div>
               </div>

               {/* Grid */}
               <div className="space-y-5">
                 <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Zap size={16} className="text-yellow-500" />
                      Active Integrations
                    </h3>
                    <span className="text-xs text-zinc-500">5 Endpoints Detected</span>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                   {DATING_APPS.map((app) => (
                     <AppCard 
                       key={app.id} 
                       app={app} 
                       loading={loadingAppId === app.id} 
                       onClick={() => handleAppSelect(app)} 
                     />
                   ))}
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
      
      {/* Dependency Modal */}
      {selectedApp && (
        <DependencyModal 
          app={selectedApp} 
          onClose={() => setSelectedApp(null)} 
        />
      )}

      {/* Simple Deposit Modal Placeholder */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-[#09090b] border border-zinc-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">Add Funds</h3>
              <p className="text-sm text-zinc-400 mb-6">Simulate a crypto deposit to your wallet.</p>
              
              <div className="flex gap-3">
                 <Button variant="secondary" onClick={() => setShowDepositModal(false)}>Cancel</Button>
                 <Button onClick={simulateDeposit} isLoading={isLoading}>Add $50.00</Button>
              </div>
           </div>
        </div>
      )}

       {/* Simple Wallet Modal Placeholder */}
       {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-[#09090b] border border-zinc-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">Connect Wallet</h3>
              <p className="text-sm text-zinc-400 mb-6">Link your Web3 provider.</p>
              
              <div className="space-y-2 mb-6">
                  {WALLET_PROVIDERS.slice(0, 3).map(p => (
                      <button key={p.id} className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center gap-3 transition-colors">
                          <div className={`w-6 h-6 rounded-full ${p.color} flex items-center justify-center text-[10px] font-bold text-white`}>{p.letter}</div>
                          <span className="text-sm font-bold text-zinc-300">{p.name}</span>
                      </button>
                  ))}
              </div>

              <div className="flex gap-3">
                 <Button variant="secondary" onClick={() => setShowWalletModal(false)}>Cancel</Button>
                 <Button onClick={handleConnectWallet} isLoading={isLoading}>Connect</Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// --- Sub-components for cleaner App.tsx ---

const NavPacket = ({ icon, label, active, badge, badgeColor = 'text-white', onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${active ? 'bg-zinc-800/80 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
  >
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { size: 18, className: active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300' })}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5 ${badgeColor}`}>{badge}</span>
    )}
  </div>
);

const AppCard: React.FC<{ app: DatingApp; loading: boolean; onClick: () => void }> = ({ app, loading, onClick }) => {
  const isComingSoon = app.status === 'coming_soon';
  const isPremiumOnly = app.status === 'premium_only';
  const isLocked = isComingSoon || isPremiumOnly;
  
  return (
    <div 
      onClick={onClick}
      className={`relative group bg-[#09090b] border border-white/5 hover:border-white/10 p-5 rounded-xl transition-all duration-300 flex items-start gap-4 overflow-hidden
        ${isLocked ? 'cursor-not-allowed opacity-80' : 'hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-0.5 cursor-pointer'}
        ${loading ? 'ring-1 ring-emerald-500/50' : ''}
      `}
    >
      {/* Background Hover Effect */}
      {!isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}

      <div className={`w-12 h-12 rounded-xl ${app.iconColor} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform group-hover:scale-105 ring-1 ring-white/10`}>
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             <>
               {app.id === 'tinder' && <TinderIcon />}
               {app.id === 'bumble' && <BumbleIcon />}
               {app.id === 'hinge' && <HingeIcon />}
               {app.id === 'okcupid' && <OkCupidIcon />}
               {app.id === 'grindr' && <GrindrIcon />}
             </>
          )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-bold text-white tracking-tight">{app.name}</h4>
          {app.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />}
        </div>
        <p className="text-xs text-zinc-500 truncate">{app.description}</p>
      </div>

      {isLocked && (
        <div className="absolute top-2 right-2 text-zinc-600">
           <Lock size={12} />
        </div>
      )}
    </div>
  );
};

export default App;