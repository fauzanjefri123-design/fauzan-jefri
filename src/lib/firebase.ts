import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if the configuration is provided and valid (not default placeholders)
const isConfigValid = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key' && 
  !firebaseConfig.apiKey.startsWith('your_') &&
  !!firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id';

let app: any = null;
let db: any = null;
let auth: any = null;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false
    }, import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID);
    auth = getAuth(app);
  } catch (err) {
    console.error("Failed to initialize actual Firebase, falling back to offline mode:", err);
    app = null;
    db = null;
    auth = null;
  }
}

// Fallback to safe dummy mock objects to support fully functional Local (LocalStorage) mode
if (!app || !db || !auth) {
  if (typeof window !== 'undefined') {
    console.warn("⚠️ Firebase is not configured or failed to initialize. Running in fully-featured Offline Local Mode.");
  }

  app = {
    name: '[Offline Fallback App]',
    options: {},
    automaticDataCollectionEnabled: false
  };

  db = {
    type: 'firestore',
    _databaseId: { projectId: 'offline', database: '(default)' }
  };

  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Trigger callback with null immediately to notify of empty/guest user state
      setTimeout(() => callback(null), 50);
      return () => {};
    },
    signOut: async () => {
      console.log("Offline logout invoked.");
    }
  } as any;
}

export { app, db, auth };
