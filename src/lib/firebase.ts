import { initializeApp, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

export let isDbInitialized = false;

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual config from the Firebase Console
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Database | undefined;

// Check if all required environment variables are set
const areFirebaseCredsSet =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId;

if (areFirebaseCredsSet) {
  try {
    // Return the existing app if it's already initialized
    app = getApp();
  } catch (err) {
    // Otherwise, initialize a new app
    app = initializeApp(firebaseConfig);
  }
  
  if (app) {
     try {
        db = getDatabase(app);
        isDbInitialized = true;
    } catch (error) {
        console.error("Firebase Database initialization failed:", error);
        // db remains undefined, app will run in a fallback mode
    }
  }
} else {
    console.warn("Firebase credentials are not set correctly in your .env file. The app will run without a database connection.");
}

export { db };
