'use client';

import type { Settings } from './data';
import { defaultSettings } from './data';

const jsonHeaders = { 'Content-Type': 'application/json' };

export const getSettings = async (): Promise<Settings> => {
  const res = await fetch('/api/settings');
  if (!res.ok) {
    console.error('Failed to load settings from database');
    return defaultSettings;
  }
  const data = await res.json();
  return { ...defaultSettings, ...data } as Settings;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await fetch('/api/settings', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(settings),
  });
};
