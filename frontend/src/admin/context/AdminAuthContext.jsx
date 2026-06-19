// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
// Delegates to AuthContext so Login.js and SuperAdminLayout share the same user state.
import { createContext, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminAuthContext = createContext();

const SUPER_ADMIN_EMAIL = 'codeofthoth@outlook.com';

export const AdminAuthProvider = ({ children }) => {
  const { user, loading, login, logout } = useAuth();

  const isSuperAdmin = !!(
    user &&
    user.role === 'SUPER_ADMIN' &&
    user.email === SUPER_ADMIN_EMAIL
  );

  const isDeptHead = user?.role === 'DEPT_HEAD_OWNER';
  const isStaff    = user?.role === 'STAFF';
  const deptSlug   = user?.departmentSlug;

  return (
    <AdminAuthContext.Provider value={{
      user, loading, login, logout,
      isSuperAdmin, isDeptHead, isStaff, deptSlug,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
