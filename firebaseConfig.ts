// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential , signOut  } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDRTaqs1kzDW_t-NtmtEyiSagfZ3dfb9ck",
  authDomain: "mytt-008.firebaseapp.com",
  projectId: "mytt-008",
  storageBucket: "mytt-008.firebasestorage.app",
  messagingSenderId: "811293413660",
  appId: "1:811293413660:android:99a0a2de2f25e3b9776ad9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function registerUser(fullName: string, phone: string, password: string): Promise<UserCredential> {
  const fakeEmail = `${phone}@mytt.com`;
  const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    fullName,
    phone
  });

  return userCredential;
}

export async function loginUser(phone: string, password: string): Promise<UserCredential> {
  const fakeEmail = `${phone}@mytt.com`;
  return signInWithEmailAndPassword(auth, fakeEmail, password);
}
