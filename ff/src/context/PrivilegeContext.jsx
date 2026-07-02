import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { axiosInstance } from '../config/axiosInstance';

const PrivilegeContext = createContext(null);

export function PrivilegeProvider({ children }) {
  const [privileges, setPrivileges] = useState([]);
  const [allowedMenuNames, setAllowedMenuNames] = useState(new Set());
  const [actionPermissions, setActionPermissions] = useState({}); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Wrap in useCallback so it can be safely exported and called elsewhere
  const fetchPrivileges = useCallback(async () => {
    const userId = sessionStorage.getItem("USER_ID");
    const role = sessionStorage.getItem("ROLE");

    if (!userId) { 
      setIsLoading(false); 
      return; 
    }

    if (role === 'admin') {
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [privRes, menuRes] = await Promise.all([
        axiosInstance.get(`/api/previlage/${userId}`),
        axiosInstance.get('/api/previlage/menu')
      ]);

      const userPrivs = privRes.data.data || [];
      const allMenus = menuRes.data.data || [];

      const menuIdToName = {};
      allMenus.forEach(m => { menuIdToName[m.id] = m.name; });

      const allowed = new Set();
      const permsMap = {};

      userPrivs.forEach(priv => {
        const menuName = menuIdToName[priv.menu_id];
        if (menuName) {
          if (priv.can_view) {
            allowed.add(menuName);
          }
          permsMap[menuName] = {
            create: !!priv.can_create, 
            edit: !!priv.can_edit,
            delete: !!priv.can_delete,
          };
        }
      });

      setPrivileges(userPrivs);
      setAllowedMenuNames(allowed);
      setActionPermissions(permsMap);
    } catch (err) {
      console.error('Failed to fetch user privileges:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run automatically on page mount/refresh
  useEffect(() => {
    fetchPrivileges();
  }, [fetchPrivileges]);

  const canAccess = (menuName) => {
    if (isAdmin) return true;
    return allowedMenuNames.has(menuName);
  };

  const canPerform = (menuName, action) => {
    if (isAdmin) return true;
    return !!actionPermissions[menuName]?.[action];
  };

  return (
    // Added fetchPrivileges to the value context
    <PrivilegeContext.Provider value={{ privileges, allowedMenuNames, isAdmin, canAccess, canPerform, isLoading, fetchPrivileges }}>
      {children}
    </PrivilegeContext.Provider>
  );
}

export const usePrivileges = () => useContext(PrivilegeContext);