// src/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';

const SignUp = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    const { user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes('Email rate limit exceeded')) {
        setError('Too many sign-up attempts. Please try again later.');
      } else {
        setError(signUpError.message);
      }
    } else {
      onSignUp(user);
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUp;
