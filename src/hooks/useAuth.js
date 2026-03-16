import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  isAdminUser,
  loginUser,
  logoutUser,
  registerUser,
  selectAuth,
} from "../store/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(selectAuth);

  const login = async (credentials) => {
    try {
      const currentUser = await dispatch(loginUser(credentials)).unwrap();
      navigate(isAdminUser(currentUser) ? "/dashboard" : "/");
      return true;
    } catch (error) {
      console.error("Login error", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message || "No se pudo iniciar sesión. Verifica tus credenciales.",
      });
      return false;
    }
  };

  const register = async (payload) => {
    try {
      const data = await dispatch(registerUser(payload)).unwrap();
      Swal.fire({
        icon: data?.emailSent ? "success" : "warning",
        title: "Cuenta creada",
        text: data?.emailSent
          ? "Tu cuenta fue creada. Revisa tu correo para verificarla."
          : "Tu cuenta fue creada, pero no pudimos enviar el correo. Puedes reenviarlo ahora.",
      });
      navigate(`/verify-email?correo=${encodeURIComponent(payload.correo)}`);
      return true;
    } catch (error) {
      console.error("Register error", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "No se pudo crear la cuenta. Verifica los datos ingresados.",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.warn("Logout request failed", error);
    }

    navigate("/login");
  };

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: isAdminUser(user),
    login,
    register,
    logout,
  };
};
