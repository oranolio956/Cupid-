
export interface DatingApp {
  id: string;
  name: string;
  iconColor: string;
  secondaryColor: string;
  description: string;
  status: 'active' | 'coming_soon' | 'premium_only';
}

export type ViewState = 'login' | 'dashboard' | 'settings';

export interface InstallLog {
  message: string;
  status: 'pending' | 'success' | 'error';
}

// --- Tinder Specific Types ---

export type TinderDashboardView = 'list' | 'create' | 'rinse';

export interface TinderModel {
  id: string;
  name: string;
  age: number;
  locationMode: 'auto' | 'manual';
  targetCities: string[];
  funnel: {
    snapchat?: string;
    instagram?: string;
    onlyfans?: string;
  };
  photoCount: number;
  status: 'active' | 'draft';
}

export type AccountStatus = 'initializing' | 'allocating_proxy' | 'cleaning_images' | 'registering' | 'verifying_sms' | 'warming_up' | 'active' | 'failed';

export interface TinderAccount {
  id: string;
  modelId: string;
  proxyIp: string;
  status: AccountStatus;
  progress: number; // 0-100
  logs: string[];
  warmUpEndTime?: number; // Timestamp
}
