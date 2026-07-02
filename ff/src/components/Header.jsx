import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Search, Menu, Sun, Mail, Bell, Calendar, ChevronDown, 
  User, ClipboardList, HelpCircle, Settings, DollarSign, LogOut 
} from 'lucide-react';
import { axiosInstance, IMAGE_BASE_URL } from '../config/axiosInstance';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [employeeData, setEmployeeData] = useState(null); 

  // Extract 'reset' from useForm to populate fetched data
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // State for dropdowns
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  
  // FIXED: Converted static arrays/booleans to state variables
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployee = async () => {
    try {
      const res = await axiosInstance.get('/api/employees/getbyid', {
        withCredentials: true,
      });
      
      const data = res.data.data;
      setEmployeeData(data);

      // Format the date to YYYY-MM-DD for the HTML date input
      const formattedDate = data.joining_date ? data.joining_date.split('T')[0] : '';

      // Reset the react-hook-form with the fetched data
      reset({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department_id || '', 
        designation: data.designation || '',
        joining_date: formattedDate,
        role: data.role || '',
        status: data.employment_status || '',
        address: data.address || ''
      });

    } catch (error) {
      console.error('Failed to fetch employee', error);
    }
  };

  // FIXED: Roles fetch logic updated to handle state correctly
// Define fetchRoles in the main component scope so your button can use it
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/api/roles', {
        withCredentials: true 
      }); 
      setAvailableRoles(response.data.data || response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [deptRes, desigRes, statusRes] = await Promise.all([
        axiosInstance.get('/api/departments', { withCredentials: true }),
        axiosInstance.get('/api/designations', { withCredentials: true }),
        axiosInstance.get('/api/status/employement_status', { withCredentials: true })
      ]);
      setDepartments(deptRes.data.data || deptRes.data);
      setDesignations(desigRes.data.data || desigRes.data);
      setEmploymentStatuses(statusRes.data.data || statusRes.data);
    } catch (error) {
      console.error('Failed to fetch departments/designations', error);
    }
  };

  // useEffect(() => {
  //   fetchDropdownData();
  //   fetchEmployee();
    
  // }, []);

  const [userData, setUserData] = useState(() => {
    return {
      name: sessionStorage.getItem('NAME') || 'Unknown User',
      role: sessionStorage.getItem('ROLE') || 'User',
      email: sessionStorage.getItem('EMAIL') || '',
      avatar: sessionStorage.getItem('IMAGE') || 'https://i.pravatar.cc/150?img=32'
    };
  });

  const [credData, setCredData] = useState({ role: '' });

const handleLogout = async () => {
  try {
    // 1. Await the API call so it finishes before redirecting
    await axiosInstance.post("/api/auth/logout", {
      sessionId: sessionStorage.getItem('SESSIONID'),
      userId:sessionStorage.getItem('USER_ID'),
    });
  } catch (error) {
    // 2. Log any errors in case the server fails to process the logout
    console.error("Error during logout:", error);
  } finally {
    // 3. Clear session storage and redirect regardless of API success/failure
    sessionStorage.clear();
    window.location.href = '/login'; 
  }
};

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('designation', data.designation);
      formData.append('joining_date', data.joining_date);
      formData.append('address', data.address);
      formData.append('department_id', data.department); 
      formData.append('employment_status', data.status); 

      if (data.role) {
        formData.append('role', data.role);
      }

      if (data.avatar && data.avatar.length > 0) {
        formData.append('avatar', data.avatar[0]);
      }

      const employeeId = employeeData?.id; 
      console.log(employeeId);
      
      
      if (!employeeId) {
        console.error("Employee ID is missing! Cannot update.");
        return;
      }

      const response = await axiosInstance.put(`/api/employees/edit/profile/${employeeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
        withCredentials: true,
      });

      if (response.data.success) {
        console.log("Profile Updated Successfully:", response.data.data);

        sessionStorage.setItem('NAME', response.data.data.name);
        if (response.data.data.avatar) {
          sessionStorage.setItem('IMAGE', response.data.data.avatar);
        }

        setUserData(prev => ({
          ...prev,
          name: response.data.data.name,
          avatar: response.data.data.avatar || prev.avatar
        }));

        closeModal();
        fetchEmployee(); 
      }
    } catch (err) {
      console.error("Failed to update profile:", err.response?.data?.message || err.message);
    }
  };


  const handleOpenProfileModal = () => {
  setIsModalOpen(true);
  setIsProfileOpen(false); // Close the dropdown menu

  // Trigger fetches ONLY when the modal opens
  fetchEmployee();
  fetchDropdownData();
  fetchRoles();
};

  return (
    <>
      {/* --- HEADER --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 relative z-40">
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search anything"
              className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative ml-2">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors focus:outline-none"
            >
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-800 leading-tight">{userData.name}</span>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <span>{userData.role}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </div>
              </div>
              <div className="relative">
                <img 
                 src={`${IMAGE_BASE_URL}${userData.avatar}`}
                  alt={userData.name} 
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                  <img 
                    src={`${IMAGE_BASE_URL}${userData.avatar}`}
                    alt={userData.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{userData.name}</div>
                    <div className="text-xs text-gray-400">
                      {userData.email || 'No email provided'}
                    </div>
                  </div>
                </div>

                <div className="px-2 py-1 mt-1">
                  <button
                   onClick={handleOpenProfileModal}
                    className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-500" /> Update Profile
                  </button>
                </div>

                <div className="border-t border-gray-50 pt-2 mt-1 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-2 py-2 text-left text-sm text-orange-500 hover:bg-orange-50 rounded-lg flex items-center gap-3 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={closeModal}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isModalOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Update Profile
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 gap-5">
              
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your Name"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Department</label>
                <select 
                  {...register('department', { required: 'Department is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                {errors.department && <span className="text-xs text-red-500">{errors.department.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Designation</label>
                <select
                  {...register('designation', { required: 'Designation is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Select Designation</option>
                  {designations.map((desig) => (
                    <option key={desig.id} value={desig.designation_name}>
                      {desig.designation_name}
                    </option>
                  ))}
                </select>
                {errors.designation && <span className="text-xs text-red-500">{errors.designation.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Joining Date</label>
                <input
                  type="date"
                  {...register('joining_date', { required: 'Date is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Role
                </label>
                <select 
                  {...register('role', { 
                    required: 'Role is required',
                    onChange: (e) => setCredData({...credData, role: e.target.value}) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={isLoading || !!error} 
                >
                  <option value="">
                    {isLoading ? 'Loading roles...' : error ? 'Error loading roles' : 'Select a role...'}
                  </option>
                  {!isLoading && !error && availableRoles.map((roleItem) => (
                    <option key={roleItem.value || roleItem.id} value={roleItem.id}>
                      {roleItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Employment Status</label>
                <select 
                  {...register('status', { required: 'Status is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-600 bg-white"
                >
                  <option value="">Select Status</option>
                  {employmentStatuses.map((statusItem) => (
                    <option key={statusItem.id} value={statusItem.id}>
                      {statusItem.status_name}
                    </option>
                  ))}
                </select>
                {errors.status && <span className="text-xs text-red-500">{errors.status.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Address</label>
                <textarea
                  placeholder="Enter address"
                  rows="3"
                  {...register('address')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Profile Photo</label>
                {employeeData?.avatar && (
                  <p className="text-xs text-slate-400 mb-2 truncate">
                    Current: {employeeData.avatar}
                  </p>
                )}
                <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white">
                  <label className="px-4 py-2 bg-slate-50 text-slate-500 border-r border-gray-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    Choose file
                    <input 
                      type="file" 
                      accept="image/*"
                      {...register('avatar')}
                      className="hidden" 
                    />
                  </label>
                  <span className="px-4 py-2 text-slate-400">Upload image</span>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2 rounded-md transition-colors shadow-sm disabled:bg-emerald-300"
              >
                {isSubmitting ? 'Saving...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}