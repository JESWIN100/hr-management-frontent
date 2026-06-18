import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("TOKEN");

  // If NOT logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in → allow access
  return <Outlet />;
};

export default ProtectedRoute;
