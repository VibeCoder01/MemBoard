
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// IMPORTANT: You must create a .env.local file in the root of your project
// and add your Firebase project's configuration.
// For example:
// NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
// NEXT_PUBLIC_FIREBASE_APP_ID="1:12345:web:abcd..."

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required config values are present.
// This prevents the app from crashing at build time or if env vars are missing.
const isConfigured = firebaseConfig.projectId && firebaseConfig.storageBucket;

const app = isConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

if (!isConfigured) {
  console.error(
    'Firebase is not configured. Please create a .env.local file with your Firebase project\'s configuration details. The app will not function correctly until this is done. See src/lib/firebase.ts for details.'
  );
}

export { db, storage };
