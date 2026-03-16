import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDMeKD48BgO--DE5AOSlbZUuDUGJY8CFRI",
  authDomain: "convocation-tracker.firebaseapp.com",
  projectId: "convocation-tracker",
  storageBucket: "convocation-tracker.firebasestorage.app",
  messagingSenderId: "103794947227",
  appId: "1:103794947227:web:8f18114e3390d54501023e"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
