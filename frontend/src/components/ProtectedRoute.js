import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute: Enforces authentication and role-based access control.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if access is granted.
 * @param {string[]|string} [props.allowedRoles] - Role(s) permitted to access this route.
 * @returns {React.ReactElement}
 */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // 1. Unauthenticated -> redirect to /login with intended role & target URL
  if (!token) {
    const intendedRole =
      Array.isArray(allowedRoles) && allowedRoles.length === 1
        ? allowedRoles[0]
        : undefined;

    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectTo: location.pathname,
          intendedRole,
        }}
      />
    );
  }

  // 2. Role restriction check
  if (allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!rolesArray.includes(role)) {
      // Safe redirect based on the user's actual authenticated role
      if (role === "BUSINESS") return <Navigate to="/business-dashboard" replace />;
      if (role === "NGO") return <Navigate to="/ngo-dashboard" replace />;
      if (role === "DELIVERY") return <Navigate to="/delivery-dashboard" replace />;
      if (role === "INDIVIDUAL") return <Navigate to="/individual" replace />;
      if (role === "ADMIN") return <Navigate to="/admin-dashboard" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
