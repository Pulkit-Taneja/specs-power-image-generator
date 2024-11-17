import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from "./firebase";
import Header from './components/header';
import SpecsInputPage from './pages/SpecsInputPage';
import LoginPage from './pages/LoginPage';
// import About from './pages/About';
// import Home from './pages/Home';

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
      <Header /> {/* Include the Header for navigation */}
      <main className="container">
        <Routes>
          {/* <Route path="/" element={<Home />} /> Define Home Page */}
          <Route path="/specs-input" element={<SpecsInputPage />} /> {/* Define Specs Input Page */}
          <Route path="/login" element={<LoginPage />} /> {/* Define About Page */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
