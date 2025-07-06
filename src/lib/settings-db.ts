
'use client';

import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Settings } from './data';
import { defaultSettings } from './data';

const settingsDocRef = doc(db, 'app-config', 'settings');

export const getSettings = async (): Promise<Settings> => {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return { ...defaultSettings, ...docSnap.data() } as Settings;
        } else {
            // If no settings exist, create them with default values
            await setDoc(settingsDocRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error("Firebase connection error, using default settings:", error);
        return defaultSettings;
    }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
    await setDoc(settingsDocRef, settings);
};
