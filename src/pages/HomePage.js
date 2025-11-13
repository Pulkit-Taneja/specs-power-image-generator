import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const HomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            navigate("/specs-input"); // Redirect to home page
          } else {
            navigate("/login");
          }
        });
    
        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);
    

    return (
        <div>
          <h1>Home Page</h1>
        </div>
    );
};

export default HomePage;
