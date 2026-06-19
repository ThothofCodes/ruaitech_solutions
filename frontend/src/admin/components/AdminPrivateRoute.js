// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminPrivateRoute = ({ children }) => {
  const { user, loading, isSuperAdmin } = useAdminAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Allow access if user is authenticated and is a super admin
  if (user && isSuperAdmin) {
    return children;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Access denied for non-super admins
  return <Navigate to="/403" replace />;
};

export default AdminPrivateRoute;