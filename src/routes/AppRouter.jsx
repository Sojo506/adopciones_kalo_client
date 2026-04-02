import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = lazy(() => import("../pages/public/Home"));
const DogAdoptionPage = lazy(() => import("../pages/public/DogAdoptionPage"));
const FollowUpPage = lazy(() => import("../pages/public/FollowUpPage"));
const StorePage = lazy(() => import("../pages/public/StorePage"));
const ProductDetailPage = lazy(() => import("../pages/public/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/public/CartPage"));
const ProfilePage = lazy(() => import("../pages/public/ProfilePage"));
const Login = lazy(() => import("../pages/auth/Login"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const CampaignsPage = lazy(() => import("../pages/public/CampaignsPage"));

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
    <Suspense fallback={<LoadingRouteState />}>
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
        <Route path="/tienda/:idProducto" element={<ProductDetailPage />} />
        <Route
          path="/carrito"
          element={
            <AuthenticatedRoute>
              <CartPage />
            </AuthenticatedRoute>
          }
        />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
    </Suspense>
  );
};

export default AppRouter;