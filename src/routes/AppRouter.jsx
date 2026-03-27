import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Home from "../pages/public/Home";
import DogAdoptionPage from "../pages/public/DogAdoptionPage";
import FollowUpPage from "../pages/public/FollowUpPage";
import StorePage from "../pages/public/StorePage";
import ProfilePage from "../pages/public/ProfilePage";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Dashboard from "../pages/dashboard/Dashboard";
import CampaignsPage from "../pages/public/CampaignsPage";

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

const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingRouteState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
      <Route path="/adopciones" element={<DogAdoptionPage />} />
      <Route
        path="/seguimiento"
        element={
          <AuthenticatedRoute>
            <FollowUpPage />
          </AuthenticatedRoute>
        }
      />
      <Route path="/tienda" element={<StorePage />} />
      <Route path="/campanias" element={<CampaignsPage />} />
      <Route
        path="/perfil"
        element={
          <AuthenticatedRoute>
            <ProfilePage />
          </AuthenticatedRoute>
        }
      />
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
