import { Platform } from 'react-native';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebase from '@react-native-firebase/app';
import { getAuth as getRNAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFirestore as getRNFirestore, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAc3IsUlK0HJsezTr-Y_8IkXj-Hf0ASYYM",
  authDomain: "mytt-008.firebaseapp.com",
  projectId: "mytt-008",
  storageBucket: "mytt-008.firebasestorage.app",
  messagingSenderId: "811293413660",
  appId: Platform.OS === 'web'
    ? "1:811293413660:web:af2af926795c357a776ad9"
    : "1:811293413660:android:your-android-app-id", // Replace with actual Android appId from Firebase Console
};

// Type aliases for clarity
type WebFirebaseApp = FirebaseApp;
type ReactNativeFirebaseApp = typeof firebase;
type WebAuth = Auth;
type ReactNativeAuth = FirebaseAuthTypes.Module;
type WebFirestore = Firestore;
type ReactNativeFirestore = FirebaseFirestoreTypes.Module;

// Initialize Firebase based on platform
let firebaseApp: WebFirebaseApp | ReactNativeFirebaseApp;
let auth: WebAuth | ReactNativeAuth;
let db: WebFirestore | ReactNativeFirestore;

if (Platform.OS === 'web') {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  firebaseApp = firebase;
  auth = getRNAuth();
  db = getRNFirestore();
}

export { firebaseApp, auth, db };