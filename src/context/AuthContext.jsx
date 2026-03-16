/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.signIn(credentials);
      const token = data?.accessToken || data?.token;
      const userData = data?.user || null;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      if (userData) {
        setUser(userData);
      } else {
        const me = await authApi.getMe();
        setUser(me?.user || me || null);
      }

      navigate("/dashboard");
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
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.signUp(payload);
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout request failed", error);
    }

    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
    setLoading(false);
  };

  const loadUserFromToken = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me?.user || me || null);
    } catch (error) {
      console.warn("Unable to refresh user", error);
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
