import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDxxlqI9hWQl6qbFJlQUmSjMjbRpkGupMU",
  authDomain: "localpulse-aa84e.firebaseapp.com",
  projectId: "localpulse-aa84e",
  storageBucket: "localpulse-aa84e.firebasestorage.app",
  messagingSenderId: "835795698464",
  appId: "1:835795698464:web:6a82a3ec8661c6312e4d45"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);