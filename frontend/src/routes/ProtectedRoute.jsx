import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard component for ASR Bank.
 * Unauthenticated requests to protected customer routes are redirected to /login.
 * Preserves target route in state so user can return after logging in.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-700">Verifying NetBanking Session...</p>
          <p className="text-xs text-slate-400">Secure connection to ASR Bank</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
