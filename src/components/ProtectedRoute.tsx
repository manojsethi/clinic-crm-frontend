import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff";
  isAuthenticate?: boolean

}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  isAuthenticate = true
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }
  if (isAuthenticate) {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  else {
    if (user && location.pathname === "/login") {
      return <Navigate to="/dashboard" state={{ from: location }} replace />;

    }
  }

  return <>{children}</>;
};
