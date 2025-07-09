// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc3IsUlK0HJsezTr-Y_8IkXj-Hf0ASYYM",
  authDomain: "mytt-008.firebaseapp.com",
  projectId: "mytt-008",
  storageBucket: "mytt-008.firebasestorage.app",
  messagingSenderId: "811293413660",
  appId: "1:811293413660:web:af2af926795c357a776ad9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Export the initialized services
export { firebaseApp, auth, db };
