import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCsxcQpru6PRkgzfW9CWyjHz6VJztdd-Ms",
    authDomain: "specs-order.firebaseapp.com",
    projectId: "specs-order",
    storageBucket: "specs-order.firebasestorage.app",
    messagingSenderId: "742277008785",
    appId: "1:742277008785:web:93ff69f90e73a8e6991e30",
    measurementId: "G-QXSVZS2LVH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const analytics = getAnalytics(app);

setPersistence(auth, browserLocalPersistence);

export { auth, provider, signInWithPopup, signOut, db, analytics };
