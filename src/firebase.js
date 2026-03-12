import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.projectId
  && firebaseConfig.appId
);

export const firebaseApp = hasRequiredConfig ? initializeApp(firebaseConfig) : null;
export const firestoreDb = firebaseApp ? getFirestore(firebaseApp) : null;

const APP_STATE_COLLECTION = 'lumina_device_state';

export const initializeFirebaseAnalytics = async () => {
  if (!firebaseApp) return null;
  const analyticsSupported = await isSupported();
  if (!analyticsSupported) return null;
  return getAnalytics(firebaseApp);
};

export const loadCloudAppState = async (deviceId) => {
  if (!firestoreDb || !deviceId) return null;

  try {
    const snapshot = await getDoc(doc(firestoreDb, APP_STATE_COLLECTION, deviceId));
    if (!snapshot.exists()) return null;
    return snapshot.data()?.payload || null;
  } catch (error) {
    console.error('Falha ao carregar estado no Firestore:', error);
    return null;
  }
};

export const saveCloudAppState = async (deviceId, payload) => {
  if (!firestoreDb || !deviceId || !payload) return false;

  try {
    await setDoc(
      doc(firestoreDb, APP_STATE_COLLECTION, deviceId),
      {
        payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Falha ao salvar estado no Firestore:', error);
    return false;
  }
};
