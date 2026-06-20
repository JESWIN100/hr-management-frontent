import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../config/axiosInstance';

// Custom Checkbox Component
const Checkbox = ({ checked, onChange, isNull }) => {
  if (isNull) return <div className="w-5 h-5" />; 
  
  return (
    <div
      onClick={onChange}
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
  const [isSaving, setIsSaving] = useState(false);

  const fetchModules = async () => {
    try {
      const response = await axiosInstance.get('/api/previlage/menu');
      const moduleData = response.data.data; 

      const formattedPrivileges = moduleData.map((module) => ({
        id: module.id,          // CRITICAL FIX: Use the actual menu ID from the DB, not the name
        name: module.caption,   
        main: false,            
        create: false,
        read: false,
        update: false,
        delete: false
      }));

      setPrivileges(formattedPrivileges);
    } catch (error) {
      console.error("Error fetching module list:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleToggle = (id, field) => {
    setPrivileges(prev => prev.map(p => {
      if (p.id === id && p[field] !== null) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    }));
  };

  // NEW: Save function
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // NOTE: You'll need to pass the actual ID of the user you are editing/creating.
      // I am hardcoding '1' for demonstration purposes.
      const payload = {
        userId: 1, 
        privileges: privileges
      };

      const response = await axiosInstance.post('/api/previlage/save', payload);
      alert(response.data.message || 'Privileges saved successfully!');
    } catch (error) {
      console.error("Error saving privileges:", error);
      alert('Failed to save privileges. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-2 font-medium">Settings / User & access</p>
          <h1 className="text-2xl font-bold text-gray-900">Add user</h1>
        </div>

        {/* General Info Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">General Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                defaultValue="Andy Worchen" 
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black transition-shadow">
                <input 
                  type="text" 
                  defaultValue="andyworchen@gmail" 
                  className="flex-1 w-full px-4 py-2.5 text-sm outline-none" 
                />
                <span className="bg-gray-50 border-l border-gray-200 px-4 py-2.5 text-gray-500 text-sm flex items-center font-medium">
                  .com
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Role & Access Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role & access</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-4 rounded-l-xl font-semibold text-sm text-gray-800 w-1/3">
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
                  <th className="py-4 px-4 rounded-r-xl font-semibold text-sm text-gray-800">
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
                        />
                        <span className="ml-3">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Checkbox 
                        checked={row.create} 
                        onChange={() => handleToggle(row.id, 'create')} 
                        isNull={row.create === null} 
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <Checkbox 
                        checked={row.read} 
                        onChange={() => handleToggle(row.id, 'read')} 
                        isNull={row.read === null} 
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <Checkbox 
                        checked={row.update} 
                        onChange={() => handleToggle(row.id, 'update')} 
                        isNull={row.update === null} 
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <Checkbox 
                        checked={row.delete} 
                        onChange={() => handleToggle(row.id, 'delete')} 
                        isNull={row.delete === null} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center">
          <button className="text-sm font-bold text-gray-800 hover:text-black transition-colors">
            Back
          </button>
          <div className="flex space-x-3">
            <button className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}