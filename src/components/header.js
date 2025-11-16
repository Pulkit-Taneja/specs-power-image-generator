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

    if (user) {
        return (
            <div className="right-content-container" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                <Link to="/specs-input" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>New Order</Link>
                <Link to="/orders" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>Orders List</Link>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>
                 
        );
    }
    return (<div></div>);

};

export default Header;
