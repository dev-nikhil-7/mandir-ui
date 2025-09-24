import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./../context/AuthContext";

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" replace />;
};
