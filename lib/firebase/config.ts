/**
 * Firebase Configuration
 * 
 * This module initializes Firebase and exports the auth instance.
 * Firebase is initialized as a singleton to prevent multiple instances.
 * 
 * @see docs/frontend_api_integration_guide.md Section 2 & 12.1
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase configuration from environment variables
 * 
 * Required env vars (set in .env.local):
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase only once (singleton pattern)
 * This is important for Next.js which can re-run module initialization
 */
function initializeFirebase(): FirebaseApp {
    const existingApps = getApps();
    if (existingApps.length > 0) {
        return existingApps[0];
    }
    return initializeApp(firebaseConfig);
}

// Initialize Firebase app (client-side only check happens in getAuth)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Only initialize on client side
if (typeof window !== 'undefined') {
    try {
        app = initializeFirebase();
        auth = getAuth(app);
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

/**
 * Get the Firebase Auth instance
 * Returns null on server-side or if initialization failed
 */
export function getFirebaseAuth(): Auth | null {
    return auth;
}

/**
 * Get the Firebase App instance
 * Returns null on server-side or if initialization failed
 */
export function getFirebaseApp(): FirebaseApp | null {
    return app;
}

// Export instances for direct access (may be null on server)
export { app, auth };

// Export config for reference (useful for debugging)
export { firebaseConfig };
