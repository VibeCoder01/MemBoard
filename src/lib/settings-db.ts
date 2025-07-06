
'use client';

import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Settings } from './data';
import { defaultSettings } from './data';

export const getSettings = async (): Promise<Settings> => {
    if (!db) {
        // This case handles when Firebase isn't configured.
        // The display board can still run with default settings.
        return defaultSettings;
    }
    try {
        const settingsDocRef = doc(db, 'app-config', 'settings');
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return { ...defaultSettings, ...docSnap.data() } as Settings;
        } else {
            // If no settings exist in Firestore, create them with default values
            await setDoc(settingsDocRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error("Firestore connection error, using default settings:", error);
        return defaultSettings;
    }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
    if (!db) {
        throw new Error("Firestore is not initialized. Check your Firebase configuration.");
    }
    const settingsDocRef = doc(db, 'app-config', 'settings');
    await setDoc(settingsDocRef, settings);
};
