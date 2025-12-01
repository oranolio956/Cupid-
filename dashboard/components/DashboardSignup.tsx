import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';
import { CRYPTO_OPTIONS, WALLET_PROVIDERS } from '../constants';
import { Activity, ShieldCheck, Zap, Wallet, ArrowRight, Coins, Lock, Sparkles, Rocket, BadgeCheck, Flame } from 'lucide-react';

interface DashboardSignupProps {
  onBack?: () => void;
}

export const DashboardSignup: React.FC<DashboardSignupProps> = ({ onBack }) => {
  const [selectedCoin, setSelectedCoin] = useState(CRYPTO_OPTIONS[0]);
  const [selectedWallet, setSelectedWallet] = useState(WALLET_PROVIDERS[0]);
  const lifetimePrice = 200;

  const paymentHeadline = selectedCoin
    ? `Send $${lifetimePrice} in ${selectedCoin.symbol}`
    : `Send $${lifetimePrice}`;

  return (
    <div className="min-h-screen bg-[#050505] text-[#e4e4e7] font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="w-auto px-4 py-2 text-sm text-zinc-400 hover:text-white"
              onClick={onBack}
            >
              Return to login
            </Button>
            <Link to="/" className="hidden" aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border border-rose-500/25 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_60px_-35px_rgba(244,63,94,0.6)]">
              <div className="absolute -top-10 -right-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl" />

              <div className="relative space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-rose-400">
                  <Sparkles size={14} />
                  Founders release
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  Not a landing page — this is the Cupid operator console
                </h1>
                <p className="text-lg text-zinc-200/90 max-w-4xl">
                  This is the same stack our team uses to keep dozens of profiles warm every night: human-written openers, rate-limited sends, and on-call operators who kill anything that looks robotic. No SaaS drip, no credit-card trials — wire $200 in crypto, claim one of ten lifetime seats, and we drop the full runbook in your inbox.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 flex items-center gap-2">
                    <ShieldCheck size={14} />
                    Lifetime deal — only 10 available
                  </div>
                  <div className="px-3 py-1.5 bg-zinc-900 text-zinc-200 text-xs font-semibold rounded-full border border-white/10 flex items-center gap-2">
                    <Lock size={14} />
                    $200 crypto payment required
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-300">
                        <Rocket size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-300">Operator-grade toolkit</p>
                        <p className="text-lg font-semibold text-white">Unlimited runs</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300/80">Ready-made AI playbooks for onboarding, warm-ups, and multi-network scaling. We tune language models to sound human, not canned.</p>
                  </div>

                  <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Crypto checkout</p>
                        <p className="text-lg font-semibold text-white">$200 one-time</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300/80">Send $200 using any supported coin and wallet. We reply with a signed activation key, onboarding checklist, and a live operator to calibrate your first runs.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button className="w-auto px-6 py-3 text-base">
                    Pay $200 & activate <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <div className="text-sm text-zinc-400 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    Secure instructions delivered instantly after payment.
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-zinc-200">
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-indigo-200">
                      <Activity size={14} /> Field log
                    </div>
                    <p className="text-zinc-300">Last 24h: 312 intros sent, 41 replies routed, 0 template flags triggered.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
                      <ShieldCheck size={14} /> Manual review
                    </div>
                    <p className="text-zinc-300">Every onboarding gets a live operator session to sanity-check tone and guardrails.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-200">
                      <Zap size={14} /> Proof of work
                    </div>
                    <p className="text-zinc-300">We ship the prompts, routing maps, and SMS/proxy configs we actually use — nothing generic.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-400 font-semibold">Step 1</p>
                  <h2 className="text-2xl font-bold text-white mt-1">Choose your coin</h2>
                  <p className="text-sm text-zinc-400">Select a supported network for the $200 lifetime transfer.</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-400 flex items-center gap-2">
                  <Coins size={14} />
                  Multichain support
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CRYPTO_OPTIONS.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedCoin.id === coin.id ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-900/20' : 'border-white/5 bg-black hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-lg font-semibold ${selectedCoin.id === coin.id ? 'text-white' : 'text-zinc-200'}`}>{coin.name}</p>
                        <p className="text-xs text-zinc-500">Network: {coin.network}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold ${coin.bg} ${coin.color.replace('text-', 'border-')} border`}>{coin.symbol}</div>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500 font-mono break-all">Address: {coin.address}</p>
                  </button>
                ))}
              </div>

              <div className="bg-black border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Transfer amount</p>
                  <p className="text-2xl font-bold text-white">${lifetimePrice}.00</p>
                  <p className="text-xs text-zinc-500">Send {selectedCoin.symbol} to the address above to lock in lifetime access.</p>
                </div>
                <Button className="w-full sm:w-auto px-5 py-3 text-base">
                  Copy {selectedCoin.symbol} details
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 font-semibold">Step 2</p>
                  <h3 className="text-xl font-bold text-white">Select a wallet provider</h3>
                  <p className="text-sm text-zinc-500">Use a wallet you trust to send the $200 payment.</p>
                </div>
              </div>

              <div className="space-y-3">
                {WALLET_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedWallet(provider)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedWallet.id === provider.id ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-900/20' : 'border-white/5 bg-black hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${provider.color} flex items-center justify-center font-bold text-white`}>{provider.letter}</div>
                      <div>
                        <p className={`text-sm font-semibold ${selectedWallet.id === provider.id ? 'text-white' : 'text-zinc-200'}`}>{provider.name}</p>
                        <p className="text-xs text-zinc-500">Pull it up, copy the address, and broadcast the $200 transfer.</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 space-y-2 text-sm text-zinc-300/90">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  Wallet stays client-side; no private keys ever stored.
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  You will receive on-chain confirmations for the $200 transfer.
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-emerald-400" />
                  Priority onboarding guaranteed for the first 10 lifetime slots.
                </div>
              </div>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-300 font-semibold">Step 3</p>
                  <h3 className="text-xl font-bold text-white">Confirm & unlock</h3>
                  <p className="text-sm text-zinc-400">After sending ${lifetimePrice}, you will receive a lifetime activation key plus our zero-fluff onboarding field kit.</p>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-zinc-300 list-disc list-inside">
                <li>Activation key delivered instantly after payment is detected.</li>
                <li>Full dashboard access, automation templates, and updates forever.</li>
                <li>Support for Tinder, Bumble, Hinge, OkCupid, and Grindr orchestration.</li>
                <li>Founders tier closes after the first 10 on-chain receipts — no re-opening.</li>
              </ul>

              <Button className="w-full py-3 text-base">
                Get lifetime access now
              </Button>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 via-black to-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-center">
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200 font-semibold">Operator pledge</p>
                  <h3 className="text-xl font-bold text-white">Why this is not a template</h3>
                  <p className="text-sm text-zinc-400">We give you battle-tested automations, not a pretty placeholder.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 flex items-start gap-3">
                  <Flame className="text-rose-400" size={18} />
                  <div>
                    <p className="font-semibold text-white">Human, sharp messaging</p>
                    <p className="text-zinc-400">We include conversation starters that sound like you — not AI slurry — tuned for each network.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 flex items-start gap-3">
                  <Rocket className="text-emerald-300" size={18} />
                  <div>
                    <p className="font-semibold text-white">Receipts & proof of work</p>
                    <p className="text-zinc-400">Every activation ships with a live operator session to set up routing, proxies, and guardrails.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 flex items-start gap-3 sm:col-span-2">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <div>
                    <p className="font-semibold text-white">No questions asked experience</p>
                    <p className="text-zinc-400">The instructions spell out exactly what to send, where to paste, and how we keep you compliant — zero guesswork.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                <span>{paymentHeadline}</span>
                <span>Wallet: {selectedWallet.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
