// import { initializeApp } from "firebase/app";
// import { getDatabase, ref } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyBbB6NVnhOwL7SLoYPxILcaVd2qkPo67L4",
//   authDomain: "erpsystem-a6d82.firebaseapp.com",
//   databaseURL: "https://erpsystem-a6d82-default-rtdb.firebaseio.com", // Add this line
//   projectId: "erpsystem-a6d82",
//   storageBucket: "erpsystem-a6d82.appspot.com",
//   messagingSenderId: "349551206344",
//   appId: "1:349551206344:web:fc178240ed4e6776622afd",
//   measurementId: "G-0QDTM802BV"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app); // Realtime Database instance

// export { db, ref };

// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBbB6NVnhOwL7SLoYPxILcaVd2qkPo67L4",
  authDomain: "erpsystem-a6d82.firebaseapp.com",
  databaseURL: "https://erpsystem-a6d82-default-rtdb.firebaseio.com",
  projectId: "erpsystem-a6d82",
  storageBucket: "erpsystem-a6d82.appspot.com",
  messagingSenderId: "349551206344",
  appId: "1:349551206344:web:fc178240ed4e6776622afd",
  measurementId: "G-0QDTM802BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };