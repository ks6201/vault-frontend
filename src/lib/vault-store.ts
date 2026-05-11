'use client';

import { create } from 'zustand';

const BASE_URL = process.env.NEXT_PUBLIC_VAULT_URL || 'http://localhost:3000';

interface AppState {
  baseUrl: string;
}

export const useVaultStore = create<AppState>(() => ({
  baseUrl: BASE_URL,
}));
