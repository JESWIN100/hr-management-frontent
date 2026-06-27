import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../config/axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import Toast from '../components/reusable/Toast';

// Custom Checkbox Component (Improved Accessibility)
const Checkbox = ({ checked, onChange, isNull, label }) => {
  if (isNull) return <div className="w-5 h-5" />; 
  
  return (
    <div
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
      aria-label={label || "Toggle permission"}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
      className={`w-5 h-5 rounded cursor-pointer flex items-center justify-center transition-colors duration-200 ${
        checked
          ? 'bg-black border border-black text-white'
          : 'bg-white border-2 border-gray-200 hover:border-gray-300'
      }`}
    >
      {checked && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
};

const HeaderIcon = () => (
  <div className="w-5 h-5 bg-black text-white rounded flex items-center justify-center mr-3">
    <div className="w-2.5 h-[2px] bg-white rounded-full"></div>
  </div>
);

export default function PrivilegeManager() {
  const [privileges, setPrivileges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { userId, name, email } = location.state || {};



const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Protection: Redirect if no user data is present
  useEffect(() => {
    if (!userId) {
      navigate('/settings/privilege');
    }
  }, [userId, navigate]);

  // UPDATED: Fetch master menus AND user's existing privileges simultaneously 
  const fetchModules = async () => {
    try {
      setIsLoading(true);
      
      // Fire both requests at the same time
      const [menuResponse, userPrivResponse] = await Promise.all([
        axiosInstance.get('/api/previlage/menu'),
        axiosInstance.get(`/api/previlage/${userId}`) // The new endpoint we created
      ]);

      const moduleData = menuResponse.data.data; 
      const userPrivs = userPrivResponse.data.data || [];

      // Convert user privileges into an easily searchable Map object based on menu_id
      const savedPrivMap = {};
      userPrivs.forEach(priv => {
        savedPrivMap[priv.menu_id] = priv;
      });

      // Map over the modules and pre-fill data if it exists in the user's saved map
      const formattedPrivileges = moduleData.map((module) => {
        const savedData = savedPrivMap[module.id];
        
        return {
          id: module.id,          
          name: module.caption,   
          // If savedData exists, they have 'main' access. 
          main: !!savedData,            
          // Map backend 1/0 integers to true/false booleans 
          create: savedData ? !!savedData.can_create : false,
          read: savedData ? !!savedData.can_view : false,
          update: savedData ? !!savedData.can_edit : false,
          delete: savedData ? !!savedData.can_delete : false
        };
      });

      setPrivileges(formattedPrivileges);
    } catch (error) {
      console.error("Error fetching module list or user privileges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchModules();
  }, [userId]);

  // Upgraded Toggle Logic
  const handleToggle = (id, field) => {
    setPrivileges((prev) => prev.map((p) => {
      if (p.id === id && p[field] !== null) {
        const newValue = !p[field];
        const updatedRow = { ...p, [field]: newValue };

        // Smart Toggle: If turning off 'main', turn off all sub-permissions
        if (field === 'main' && !newValue) {
          updatedRow.create = false;
          updatedRow.read = false;
          updatedRow.update = false;
          updatedRow.delete = false;
        }
        
        // Smart Toggle: If checking a sub-permission, ensure 'main' is turned on
        if (field !== 'main' && newValue) {
          updatedRow.main = true;
        }

        return updatedRow;
      }
      return p;
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const payload = {
        userId: userId,
        privileges: privileges
      };

      const response = await axiosInstance.post('/api/previlage/save', payload);
      setToastConfig({
        isOpen: true,
        title: 'Success',
        message: response.data.message || 'Privileges saved successfully!'
      });
    setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error("Error saving privileges:", error);
      setToastConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save privileges. Check console for details.'
      });
    } finally {
      setIsSaving(false);
    }
  };
const closeToast = () => setToastConfig(prev => ({ ...prev, isOpen: false }));
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Permissions</h1>
        </div>

        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full name
              </label>
              <input 
                type="text" 
                defaultValue={name || ""}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none transition-shadow" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input 
                type="email" 
                defaultValue={email || ""}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none transition-shadow" 
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Role & Access Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role & access</h2>
          
          {isLoading ? (
            <div className="py-12 flex justify-center items-center text-gray-500">
               <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
               Loading modules...
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-4 font-semibold text-sm text-gray-800 w-1/3">
                      <div className="flex items-center"><HeaderIcon /> Module</div>
                    </th>
                    <th className="py-4 px-4 font-semibold text-sm text-gray-800">
                      <div className="flex items-center"><HeaderIcon /> Create</div>
                    </th>
                    <th className="py-4 px-4 font-semibold text-sm text-gray-800">
                      <div className="flex items-center"><HeaderIcon /> Read</div>
                    </th>
                    <th className="py-4 px-4 font-semibold text-sm text-gray-800">
                      <div className="flex items-center"><HeaderIcon /> Update</div>
                    </th>
                    <th className="py-4 px-4 font-semibold text-sm text-gray-800">
                      <div className="flex items-center"><HeaderIcon /> Delete</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {privileges.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <Checkbox 
                            checked={row.main} 
                            onChange={() => handleToggle(row.id, 'main')} 
                            isNull={false} 
                            label={`Toggle main access for ${row.name}`}
                          />
                          <span className="ml-3">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Checkbox 
                          checked={row.create} 
                          onChange={() => handleToggle(row.id, 'create')} 
                          isNull={row.create === null} 
                          label={`Toggle create access for ${row.name}`}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <Checkbox 
                          checked={row.read} 
                          onChange={() => handleToggle(row.id, 'read')} 
                          isNull={row.read === null} 
                          label={`Toggle read access for ${row.name}`}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <Checkbox 
                          checked={row.update} 
                          onChange={() => handleToggle(row.id, 'update')} 
                          isNull={row.update === null} 
                          label={`Toggle update access for ${row.name}`}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <Checkbox 
                          checked={row.delete} 
                          onChange={() => handleToggle(row.id, 'delete')} 
                          isNull={row.delete === null} 
                          label={`Toggle delete access for ${row.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm font-bold text-gray-800 hover:text-black transition-colors"
          >
            Back
          </button>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving || isLoading}
              className={`px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors ${
                (isSaving || isLoading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>

      </div>
      <Toast 
        isOpen={toastConfig.isOpen}
        onClose={closeToast}
        title={toastConfig.title}
        message={toastConfig.message}
        timeAgo="Just now"
      />
    </div>
  );
}