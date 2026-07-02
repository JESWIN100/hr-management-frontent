// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { usePrivileges } from '../context/PrivilegeContext';

export default function PrivateRoute({ menuName, children }) {
  const { canAccess, isLoading } = usePrivileges();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No menuName means no restriction (e.g. dashboard)
  if (menuName && !canAccess(menuName)) {
    return <Navigate to="/" replace />;
  }

  return children;
}