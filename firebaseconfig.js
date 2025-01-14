import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCHf23oN2KibhfWwpaqcmLxGCFjsL-1jo",
  authDomain: "fir-1-94c78.firebaseapp.com",
  projectId: "fir-1-94c78",
  storageBucket: "fir-1-94c78.firebasestorage.app",
  messagingSenderId: "157550317485",
  appId: "1:157550317485:web:1273bc94be783fa343db24"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { firebaseApp, db, auth };
 