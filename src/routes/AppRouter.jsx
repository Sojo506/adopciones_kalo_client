import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Dashboard from "../pages/dashboard/Dashboard";

const LoadingRouteState = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingRouteState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const VerifyEmailRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isEmailVerified, loading } = useAuth();

  if (loading) {
    return <LoadingRouteState />;
  }

  if (isAuthenticated && isEmailVerified) {
    return <Navigate to={isAdmin ? "/dashboard" : "/"} replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/verify-email"
        element={
          <VerifyEmailRoute>
            <VerifyEmail />
          </VerifyEmailRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
