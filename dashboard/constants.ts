import { LucideIcon } from 'lucide-react';

export interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  color: string;
  bg: string;
  address: string;
  network: string;
}

export interface WalletProvider {
  id: string;
  name: string;
  color: string;
  letter: string;
  icon?: LucideIcon;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  savings: string | null;
}

export const CRYPTO_OPTIONS: CryptoOption[] = [
  { id: 'USDT', name: 'Tether (TRC20)', symbol: 'USDT', color: 'text-emerald-500', bg: 'bg-emerald-500/10', address: 'TEQQ...8J2', network: 'TRON' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', color: 'text-purple-500', bg: 'bg-purple-500/10', address: '83K...9L2', network: 'Solana' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', color: 'text-indigo-400', bg: 'bg-indigo-500/10', address: '0x71...C9', network: 'ERC20' },
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-500', bg: 'bg-orange-500/10', address: 'bc1q...92', network: 'Bitcoin' },
  { id: 'LTC', name: 'Litecoin', symbol: 'LTC', color: 'text-zinc-300', bg: 'bg-zinc-500/10', address: 'LQt...88', network: 'Litecoin' },
];

export const WALLET_PROVIDERS: WalletProvider[] = [
  { id: 'metamask', name: 'MetaMask', color: 'bg-orange-500', letter: 'M' },
  { id: 'coinbase', name: 'Coinbase Wallet', color: 'bg-blue-600', letter: 'C' },
  { id: 'phantom', name: 'Phantom', color: 'bg-purple-500', letter: 'P' },
  { id: 'trust', name: 'Trust Wallet', color: 'bg-cyan-500', letter: 'T' },
  { id: 'walletconnect', name: 'WalletConnect', color: 'bg-indigo-500', letter: 'W' }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'lifetime', name: 'Lifetime Access', price: 200, period: 'Forever', savings: 'Founders deal — first 10 only' }
];
