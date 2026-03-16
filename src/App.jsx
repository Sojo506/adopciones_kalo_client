import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRouter from "./routes/AppRouter";
import { initializeAuth } from "./store/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
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
