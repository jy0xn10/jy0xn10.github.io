import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyB6QaVHTwzg75lxhLClLdNTYGLxdCtXA_A",
    authDomain: "homepage-5778f.firebaseapp.com",
    projectId: "homepage-5778f",
    storageBucket: "homepage-5778f.firebasestorage.app",
    messagingSenderId: "725179192613",
    appId: "1:725179192613:web:d76d7907472f6603c776cc",
    measurementId: "G-BQYSSPNP7Q"
    };

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  return {
    provide: {
      db
    }
  }
})