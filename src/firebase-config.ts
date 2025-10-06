// firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Configuração do Firebase - valores do projeto escala-peniel
// Você pode sobrescrever criando um arquivo .env.local com REACT_APP_FIREBASE_*
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD6wTNUm3_tDgAAVwjv296RqQKoy0L3cPs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "escala-peniel.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "escala-peniel",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "escala-peniel.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "871367723509",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:871367723509:web:598016ce0c839cf5a5f8bc",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Messaging apenas se suportado (PWA)
// Messaging: nem todos os ambientes suportam (ex: desktop sem SW).
// Em vez de exportar uma Promise diretamente, exponha uma função async que
// retorna o Messaging ou null. Assim o restante do app pode await getFirebaseMessaging().
let _messaging: any = null;
export const getFirebaseMessaging = async (): Promise<any | null> => {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    if (!_messaging) {
      _messaging = getMessaging(app);
    }
    return _messaging;
  } catch (err) {
    console.warn('Firebase messaging not available:', err);
    return null;
  }
};

export default app;

/*
Notes / next steps for Push Notifications (FCM):

- Install the firebase SDK: npm install firebase
- For web push you must add a service worker at public/firebase-messaging-sw.js
  and include Firebase's messaging handler there.
- Provide your VAPID key when requesting token with getToken({ vapidKey: 'YOUR_VAPID_KEY' })
- Store FCM tokens per user (collection `fcmTokens`) and send notifications via
  Cloud Functions or your backend using the Admin SDK.
*/