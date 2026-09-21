import React, { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt 
} from "react-icons/fa";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", loginData);

      const data = response.data;

      if (data.success) {
        if (data.user && data.user.email && data.user.email.toLowerCase() === "jeehardik2@gmail.com") {
          data.user.role = "admin";
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        alert("Login Successful! 🎉");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Server Error. Please try again later.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-canvas">
      {/* Animated Background Orbs */}
      <div className="login-orb orb-cyan"></div>
      <div className="login-orb orb-pink"></div>

      <div className="login-card glass-panel">
        <div className="login-header">
          <h1>Welcome Back <span className="wave">👋</span></h1>
          <p>Login to your <span className="neon-text">LostFinder</span> account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="input-group">
            <label>College Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="student@college.edu"
                value={loginData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn gradient-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">Logging In...</span>
            ) : (
              <>
                <span>Login</span>
                <FaSignInAlt className="btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;