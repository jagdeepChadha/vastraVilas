import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    const { name, username, email, password, gender } = formData;

    if (!name || !username || !email || !password || !gender) {
      toast.error("All fields are required!", { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Account created successfully!", { autoClose: 2000 });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Signup failed!", { autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Server error. Try again!", { autoClose: 2000 });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-container-box">
            <p className="signup-header">Create an account</p>

            <input
              type="text"
              name="name"
              className="input-box"
              placeholder="Enter Name here"
              onChange={handleChange}
            />
            <input
              type="text"
              name="username"
              className="input-box"
              placeholder="Enter Username here"
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              className="input-box"
              placeholder="Enter Email here"
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              className="input-box"
              placeholder="Enter Password here"
              onChange={handleChange}
            />

            <div className="gender-selection">
              <label>Gender:</label>
              <input
                type="radio"
                name="gender"
                value="Male"
                id="Male"
                onChange={handleChange}
              />
              <label htmlFor="male">Male</label>
              <input
                type="radio"
                name="gender"
                value="Female"
                id="Female"
                onChange={handleChange}
              />
              <label htmlFor="female">Female</label>
            </div>

            <button className="button" onClick={handleSignup}>
              Sign Up
            </button>

            <div className="login-text">
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Login here.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
