import { getAuth, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBbB6NVnhOwL7SLoYPxILcaVd2qkPo67L4",
  authDomain: "erpsystem-a6d82.firebaseapp.com",
  databaseURL: "https://erpsystem-a6d82-default-rtdb.firebaseio.com",
  projectId: "erpsystem-a6d82",
  storageBucket: "erpsystem-a6d82.firebasestorage.app",
  messagingSenderId: "349551206344",
  appId: "1:349551206344:web:fc178240ed4e6776622afd",
  measurementId: "G-0QDTM802BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Force logout on page reload
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    window.addEventListener("beforeunload", () => {
      signOut(auth);
    });
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

export { db, auth };
