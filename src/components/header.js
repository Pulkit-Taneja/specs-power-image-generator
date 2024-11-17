// src/components/Header.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged,signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from 'react-router-dom'; // Link is used for navigation

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set user state if logged in
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate("/"); // Redirect to login page after logout
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header>
        <nav className="navbar">
            <ul className="navbar-list">
            {user ? (
                <>
                    <li>Welcome, {user.displayName}</li>
                    <li><Link to="/specs-input">Specs Input</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                </>
                ) : (
                <li><Link to="/login">Login</Link></li>
            )}
            </ul>
        </nav>
        </header>
    );
};

export default Header;
