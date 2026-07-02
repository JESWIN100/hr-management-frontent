import React, { useState, useEffect } from 'react';
import { axiosInstance, IMAGE_BASE_URL } from '../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/reusable/DataTable';

export default function PrivilegeTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/previlage/users/list");
      
      if (response.data.success) {
        const formattedUsers = response.data.data.map(u => {
          // The backend now returns an array of objects for assigned_modules
          return {
            id: u.id,
            user_id: u.user_id || u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            role: u.role || 'User', // Fallback if backend doesn't return role
            modules: u.assigned_modules || [], 
            hasPrivileges: u.privilege_count > 0,
            accessLevel: u.privilege_count > 0 ? 'Custom Access' : 'None',
          };
        });

        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

// Helper function to render explicit TRUE/FALSE UI for each module
  const renderPermissionStatus = (modules, permissionKey) => {
    if (!modules || modules.length === 0) {
      return <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">No Modules</span>;
    }

    return (
      <div className="flex flex-col gap-1.5">
        {modules.map((m, index) => {
          const isTrue = m[permissionKey]; // Evaluates to true or false

          return (
            <div 
              key={index} 
              className="flex items-center justify-between gap-3  px-2 py-1.5 rounded-md border border-gray-100 "
            >
              <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                {m.moduleName}
              </span>
              
              {isTrue ? (
                // TRUE UI (Green)
                <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  TRUE
                </span>
              ) : (
                // FALSE UI (Red)
                <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  FALSE
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Updated columns configuration
  const columns = [
    {
      label: 'User Info',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img 
            src={row.avatar ? `${IMAGE_BASE_URL}${row.avatar}` : '/default-avatar.png'}
            alt={row.name} 
            className="w-8 h-8 rounded-full object-cover bg-slate-100 border border-gray-200" 
          />
          <div className="flex flex-col">
            <span 
             onClick={() => navigate('/settings/privilege', { 
                state: { 
                  userId: row.user_id, 
                  name: row.name, 
                  email: row.email 
                } 
              })}
              className="text-sm font-bold text-gray-900 cursor-pointer hover:text-blue-600"
            >
              {row.name}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      label: 'Read',
      key: 'read',
      render: (row) => renderPermissionStatus(row.modules, 'read')
    },
    {
      label: 'Create',
      key: 'create',
      render: (row) => renderPermissionStatus(row.modules, 'write') // Backend maps to write
    },
    {
      label: 'Edit',
      key: 'edit',
      render: (row) => renderPermissionStatus(row.modules, 'edit')
    },
    {
      label: 'Delete',
      key: 'delete',
      render: (row) => renderPermissionStatus(row.modules, 'delete')
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans ">
      <div className="max-w-7xl  mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 ">
        
       

        {/* DataTable Section */}
        {isLoading ? (
          <div className="py-10 text-center text-gray-500 flex justify-center items-center gap-2">
             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             Loading users...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={users} 
            showControls={true} 
          />
        )}

      </div>
    </div>
  );
}