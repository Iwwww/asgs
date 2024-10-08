import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/api/constants";

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
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchUserInfo(storedToken);
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
    } catch (error: any) {
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
      const { token } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setIsAuthenticated(true);
      fetchUserInfo(token);
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    token,
    login,
    logout,
  };
};
