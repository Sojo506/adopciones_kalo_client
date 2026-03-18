import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRouter from "./routes/AppRouter";
import { clearAuthState, initializeAuth } from "./store/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

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
