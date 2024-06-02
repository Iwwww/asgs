import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

interface LoginResponse {
  token: string;
  role: "factory" | "carrier" | "sale_point";
}

interface User {
  id: number;
  username: string;
  role: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await axios.get<User>(`${API_URL}/user-info/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error(
        "Error fetching user info:",
        error.response?.data || error.message,
      );
      if (error.response?.status === 403) {
        console.error(
          "Access forbidden: You don't have permission to access this resource.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/api-token-auth/`,
        { username, password },
      );
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      fetchUserInfo(response.data.token);
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};
