import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — Role-based route guard for ASR Bank.
 *
 * Props:
 *  - allowedRoles: string[] — if provided, user must have one of these roles.
 *    If omitted, any authenticated user is allowed.
 *  - children: optional — rendered as children or falls through to <Outlet />.
 *
 * Redirects:
 *  - Unauthenticated → /login (preserving target in location state)
 *  - Wrong role → the user's own role-home route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user, getRoleHome } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Verifying NetBanking Session...</p>
          <p className="text-xs text-slate-400">Secure connection to ASR Bank</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role enforcement: redirect the user to their own workspace if they try a forbidden route
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleHome()} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
