import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { showToast } from '../utils/toastUtils';
import './Login.css';
import Header from './Header';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.errors?.map((err) => err.msg).join(', ') || data.error || 'Login failed';
        showToast.error(errorMessage);
        return;
      }

      login(data.auth_token);
      showToast.success('Login successful!');
      navigate('/home');
    } catch (err) {
      showToast.error('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>
          <h6 className='text-center text-white mb-5'>You have to login in order to use admin panel.</h6>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash"></i> // Font Awesome Icon for Hide
                ) : (
                  <i className="fas fa-eye"></i> // Font Awesome Icon for Show
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
