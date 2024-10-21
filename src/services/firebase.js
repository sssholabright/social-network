// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjuWxMFxNKjsngBBUP_k_eAHh9m2opi8o",
  authDomain: "social-net-197b6.firebaseapp.com",
  projectId: "social-net-197b6",
  storageBucket: "social-net-197b6.appspot.com",
  messagingSenderId: "503119852474",
  appId: "1:503119852474:web:9e37adedb2ae256e49a383",
  measurementId: "G-WNNE8K8ZXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };