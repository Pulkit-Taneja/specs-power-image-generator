import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, provider, signInWithPopup } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

const LoginPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is already logged in
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            navigate("/specs-input"); // Redirect to home page
          }
        });
    
        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [navigate]);
    

    const checkIfInvited = async (email) => {
        const docRef = doc(db, "invited_users", email);
        const docSnap = await getDoc(docRef);
    
        return docSnap.exists();
    };
    
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const userEmail = result.user.email;
        
            const isInvited = await checkIfInvited(userEmail);
            if (isInvited) {
                setUser(result.user);
            } else {
                alert("You are not invited to access this application.");
            }
        } catch (error) {
            console.error("Error signing in: ", error);
        }
    };

    return (
        <div>
          <h1>Login Page</h1>
          <button onClick={handleLogin}>Login with Google</button>
        </div>
    );
};

export default LoginPage;
