import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../utils/authApi";

const AuthGuard = ({ children }) => {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AuthGuard;

