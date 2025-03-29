import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Footer from "./Footer";
import ReCAPTCHA from "react-google-recaptcha";
import GoogleAuthenticator from "./GoogleAuthenticator";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { showToast, persistentToast } from "../utils/toastUtils";

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login with loginId:", loginId);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { loginId, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login response:", response.data);
      
      // Use the login function from AuthContext
      await login(response.data.auth_token);
      
      // Use persistent toast instead of regular toast so it persists across navigation
      persistentToast.show(
        'login-success', // unique ID for this toast
        "Login successful! Welcome back.", 
        'success',
        { autoClose: 5000 }
      );
      
      // Navigate immediately while showing the toast
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.errors?.map(e => e.msg).join(", ") || 
                          err.response?.data?.error || 
                          "Login failed. Please check your credentials.";
      
      // Use the toast utility for error messages
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>
          <div className="form-group">
            <label htmlFor="loginId">Username or Email</label>
            <input
              type="text"
              id="loginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Enter your username or email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
                disabled={isLoading}
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash"></i> 
                ) : (
                  <i className="fas fa-eye"></i> 
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="google-login">
            <GoogleAuthenticator navigate={navigate} />
          </div>

          <p className="register-link">
            Don't have an account?{" "}
            <span onClick={() => !isLoading && navigate("/register")}>Register</span>
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;
