import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <span>© {new Date().getFullYear()} Adopciones Kalö</span>
        <span className="small">Hecho con ❤️</span>
      </div>
    </footer>
  );
};

export default Footer;
