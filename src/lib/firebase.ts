
import { initializeApp, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

export let isDbInitialized = false;

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCzJbv7SALnfh87QAKHiLPmgQoEuU-EIFE",
  authDomain: "pizza-profit-pilot.firebaseapp.com",
  databaseURL: "https://pizza-profit-pilot-default-rtdb.firebaseio.com",
  projectId: "pizza-profit-pilot",
  storageBucket: "pizza-profit-pilot.firebasestorage.app",
  messagingSenderId: "447092193869",
  appId: "1:447092193869:web:805d299d65623e2b6b7a04"
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
    console.warn("Firebase credentials are not set correctly. The app will run without a database connection.");
}

export { db };
