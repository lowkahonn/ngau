import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCMF7WAIpV-qIQPWU2ncuC_Z1e_d_bfRiQ",
  authDomain: "ngau-b56d1.firebaseapp.com",
  projectId: "ngau-b56d1",
  storageBucket: "ngau-b56d1.firebasestorage.app",
  messagingSenderId: "800846509306",
  appId: "1:800846509306:web:913874d77f3ccb8ded4543",
  measurementId: "G-27VBDB13JF"
};

let analyticsInitPromise;

function getOrCreateFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function initializeGoogleAnalytics() {
  if (!import.meta.env.PROD) return Promise.resolve(null);
  if (typeof window === "undefined") return Promise.resolve(null);

  if (!analyticsInitPromise) {
    analyticsInitPromise = isSupported()
      .then((supported) => {
        if (!supported) return null;
        const app = getOrCreateFirebaseApp();
        return getAnalytics(app);
      })
      .catch((error) => {
        console.error("Firebase Analytics initialization failed:", error);
        return null;
      });
  }

  return analyticsInitPromise;
}

