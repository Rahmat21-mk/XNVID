import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "mesmerizing-oxygen-p3bk6",
  appId: "1:581594802600:web:e76602aae2122414bb159d",
  apiKey: "AIzaSyAu5DPUaKajsVoG-yt5jZlgGOKJmnk1LOY",
  authDomain: "mesmerizing-oxygen-p3bk6.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-elearningxnvd-bbc434d5-6f5b-4446-abb7-ed49c550219e",
  storageBucket: "mesmerizing-oxygen-p3bk6.firebasestorage.app",
  messagingSenderId: "581594802600",
  measurementId: "",
  oAuthClientId: "581594802600-dbjvia7am02vieg6tif1d8jo95ujjhdg.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Uji konektivitas cloud database
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Klien offline atau memeriksa konfigurasi Firebase.");
      return false;
    }
    // Jika dokumen tidak ada, koneksi tetap berhasil
    return true;
  }
}
