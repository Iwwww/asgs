import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Navigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("user:", user.role);
    logout();
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case "factory":
      return <Navigate to="/factory" />;
    case "carrier":
      return <Navigate to="/carrier" />;
    case "sale_point":
      return <Navigate to="/sale-point" />;
    default:
      logout();
      return <Navigate to="/login" />;
  }
};

export default Dashboard;
