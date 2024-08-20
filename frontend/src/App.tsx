import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import FactoryPage from "./pages/FactoryPage";
import CarrierPage from "./pages/CarrierPage";
import SalePointPage from "./pages/SalePointPage";
import { useAuth } from "./hooks/useAuth";
import FactoryPageTest from "./pages/FactoryPage.tsx";

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/factory"
          element={
            isAuthenticated ? <FactoryPageTest /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/carrier"
          element={isAuthenticated ? <CarrierPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/sale-point"
          element={
            isAuthenticated ? <SalePointPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
