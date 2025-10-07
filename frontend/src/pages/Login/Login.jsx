import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { AuthContext } from "../../contexts/AuthContext"; 

function Login() {
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast.error("Please fill in both fields!", { autoClose: 2000 });
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
        formData,
        { withCredentials: true }
      );
  
      console.log(response.data);

      if (response.status === 200) {
        toast.success("Login successful!", { autoClose: 1000 });
  
        await checkAuth(); 
        
        if (response.data.isAdmin) {
          navigate("/adminDashboard");
        } else {
          navigate("/productList");
        }
      } else {
        toast.error(response.data.message || "Login failed!", { autoClose: 2000 });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server error. Try again!", {
        autoClose: 2000,
      });
    }
  };
  

  return (
    <>
      <ToastContainer />
      <div className="login-page">
        <div className="login-container">
          <div className="login-container-box">
            <p className="login-header">Enter Credentials:</p>
            <input
              type="text"
              name="username"
              className="input-box"
              placeholder="Enter Username here"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              className="input-box"
              placeholder="Enter Password here"
              value={formData.password}
              onChange={handleChange}
            />
            <button className="button" onClick={handleLogin}>
              Login
            </button>
            <div className="signup-text">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign Up here.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
