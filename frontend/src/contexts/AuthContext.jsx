import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/authCheck`, {
        withCredentials: true,
      });

      if (response.data?.authenticated) {
        setAuthenticated(true);
        setUser(response.data.user || null);
        setIsAdmin(response.data.user?.isAdmin || false);
      } else {
        setAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authenticated, setAuthenticated, isAdmin, user, setUser, checkAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
