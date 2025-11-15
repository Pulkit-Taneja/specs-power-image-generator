import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, provider, signInWithPopup, signOut } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import "./LoginPage.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                navigate("/specs-input");
            }
        });

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
                // Log out the unauthorized user
                await signOut(auth);
            }
        } catch (error) {
            console.error("Error signing in: ", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome Back!!!</h1>
                <p className="login-subtitle">Sign in to access your account</p>
                {/* Add GIF below */}
                <div className="gif-container">
                    <iframe src="https://giphy.com/embed/w7vmpCL3mrcz4tLJlv" frameBorder="0" class="giphy-embed"></iframe>
                </div>
                <button className="login-button" onClick={handleLogin}>
                    Login with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;