// app/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration object (from Firebase Console)
const firebaseConfig = {
  apiKey: "apikey",
  authDomain: "springgreens-afe09.firebaseapp.com",
  projectId: "springgreens-afe09",
  storageBucket: "springgreens-afe09.appspot.com",
  messagingSenderId: "368919350125",
  appId: "1:368919350125:web:b0ed55f39f8a67a00c2864",
  measurementId: "G-VJ3KHGSJ3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };