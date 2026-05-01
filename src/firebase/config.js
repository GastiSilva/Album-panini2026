/**
 * Firebase configuration
 *
 * Replace the values below with your own Firebase project credentials.
 * Never commit real API keys — use environment variables in production.
 *
 * How to get your config:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create/select your project
 * 3. Project Settings → Your apps → Web app → SDK setup
 */

// IMPORTANT: Replace these placeholder values with your actual Firebase config
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID'
}
