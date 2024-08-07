// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import supabase from './supabaseClient';
import Login from './Login';
import SignUp from './Signup';
import Dashboard from './Dashboard';
import Editor from './TipTapEditor'
const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setUser(session?.user ?? null);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignUp = (user) => {
    setUser(user);
  };

  const handleLogin = (user) => {
    setUser(user);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/documents/:docId" 
          element={user ? <Editor /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
