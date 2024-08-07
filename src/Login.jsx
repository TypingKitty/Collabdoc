// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('Error logging in: ' + signInError.message);
    } else {
      onLogin(session.user);
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
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
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login;
