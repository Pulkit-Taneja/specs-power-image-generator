import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from "./firebase";
import Header from './components/header'; 
import SpecsInputPage from './pages/SpecsInputPage';
import LoginPage from './pages/LoginPage';
import OrdersListPage from './pages/OrdersListPage';
// import About from './pages/About';
import HomePage from './pages/HomePage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      if (currentUser) {
        console.log("setting user")
        setUser(currentUser); // User is signed in
      } else {
        setUser(null); // No user is signed in
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Optionally show a loading spinner
  }

  return (
    <Router>
      <main className="container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} /> Define Home Page
          <Route path="/specs-input" element={<SpecsInputPage />} /> {/* Define Specs Input Page */}
          <Route path="/orders" element={<OrdersListPage />} /> {/* Define Orders List Page */}
          <Route path="/login" element={<LoginPage />} /> {/* Define About Page */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
