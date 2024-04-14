// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAK7T49FWD-4vsNVWKK0XugkfRxg8m6zUI",
  authDomain: "lets-chat-cfc15.firebaseapp.com",
  projectId: "lets-chat-cfc15",
  storageBucket: "lets-chat-cfc15.appspot.com",
  messagingSenderId: "419876413998",
  appId: "1:419876413998:web:3bdad89ae70d14ea3f75bf",
  measurementId: "G-LYF9QK1R98",
  databaseURL: "https://lets-chat-cfc15-default-rtdb.europe-west1.firebasedatabase.app",
  

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app)
export const auth = getAuth(app)