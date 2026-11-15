import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJf99ndS4Drymfmz3GBHrzjW7QsTMU2WI",
  authDomain: "regali-natale-famiglia.firebaseapp.com",
  projectId: "regali-natale-famiglia",
  storageBucket: "regali-natale-famiglia.firebasestorage.app",
  messagingSenderId: "856807569019",
  appId: "1:856807569019:web:6dfccec7b29753675294de",
  measurementId: "G-62HCYNGF99"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
