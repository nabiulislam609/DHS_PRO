import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCPspSCmHy6oDFsb6rZymK9_Xj2MaG0KhA",
  authDomain: "dhsedu.firebaseapp.com",
  projectId: "dhsedu",
  storageBucket: "dhsedu.firebasestorage.app",
  messagingSenderId: "600129364924",
  appId: "1:600129364924:web:7185ebc1e510d2f5b281b9",
  measurementId: "G-DCP571BTV9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
