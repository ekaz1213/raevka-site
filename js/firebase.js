// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, 
  serverTimestamp,
  where 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0IO4Hzh7eSwAVuoTJZgsM7oLsyYKNGQ8",
  authDomain: "raevkasite.firebaseapp.com",
  projectId: "raevkasite",
  storageBucket: "raevkasite.firebasestorage.app",
  messagingSenderId: "1010271871051",
  appId: "1:1010271871051:web:0d9ceddc479b8f42196dce",
  measurementId: "G-WX9NNSVVLQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { 
  auth, db, storage,
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, updateDoc, serverTimestamp, where,
  ref, uploadBytes, getDownloadURL 
};
