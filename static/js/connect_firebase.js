// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  query,
  collection,
  getDoc,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_mnZupO4Y8-qDm_0UiXWf7zw4HLxoXjI",
  authDomain: "blu-hp.firebaseapp.com",
  projectId: "blu-hp",
  storageBucket: "blu-hp.appspot.com",
  messagingSenderId: "700062325335",
  appId: "1:700062325335:web:579a4136f7d877276ca112",
  measurementId: "G-PW4V6EKVDB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log("Det Funket! Her er objektet for databasen:");
console.log(db);
