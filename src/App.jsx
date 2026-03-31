import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRouter from "./routes/AppRouter";
import { clearAuthState, initializeAuth, selectUser } from "./store/authSlice";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const AuthInitializer = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(clearAuthState());
    };

    window.addEventListener("auth:expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:expired", handleSessionExpired);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if ((event.key === AUTH_TOKEN_KEY || event.key === AUTH_USER_KEY) && !event.newValue) {
        dispatch(clearAuthState());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!user || !API_BASE_URL || typeof window === "undefined" || typeof EventSource === "undefined") {
      return undefined;
    }

    const eventSource = new EventSource(`${API_BASE_URL}/auth/events`, {
      withCredentials: true,
    });

    const handleForceLogout = () => {
      eventSource.close();
      window.dispatchEvent(new CustomEvent("auth:expired"));
    };

    eventSource.addEventListener("force-logout", handleForceLogout);

    return () => {
      eventSource.removeEventListener("force-logout", handleForceLogout);
      eventSource.close();
    };
  }, [user]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
