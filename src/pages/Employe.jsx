import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DataTable from '../components/reusable/DataTable';
import SubtleButton from '../components/reusable/SubtleButton';
import { axiosInstance, IMAGE_BASE_URL } from './../config/axiosInstance';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
export default function Employe() {
  // Modal & Dropdown state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null); // Track if we are editing

  // State for dynamic dropdowns
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch employees
  const fetchemploye = async () => {
    try {
      const res = await axiosInstance.get('/api/employees', {
        withCredentials: true,
      });
      setEmployeeData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  // Fetch dynamic dropdown data
  const fetchDropdownData = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        axiosInstance.get('/api/departments', { withCredentials: true }),
        axiosInstance.get('/api/designations', { withCredentials: true })
      ]);
      setDepartments(deptRes.data.data || deptRes.data);
      setDesignations(desigRes.data.data || desigRes.data);
    } catch (error) {
      console.error('Failed to fetch departments/designations', error);
    }
  };

  useEffect(() => {
    fetchemploye();
    fetchDropdownData();
  }, []);

  // Helper to cleanly close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    reset({
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      joining_date: '',
      status: 'Active',
      address: ''
    }); // Clear form values
  };

  // Handle Form Submission (Create & Update)
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('department_id', data.department);
      formData.append('designation', data.designation);
      formData.append('joining_date', data.joining_date);
      formData.append('status', data.status);
      formData.append('address', data.address);
      
      if (data.avatar && data.avatar.length > 0) {
        formData.append('avatar', data.avatar[0]);
      }

      if (editId) {
        // Update API call
        // Note: Some frameworks (like Laravel) require POST with _method=PUT for multipart/form-data
        // formData.append('_method', 'PUT'); 
        await axiosInstance.put(`/api/employees/edit/${editId}`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create API call
        await axiosInstance.post('/api/employees', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      closeModal();
      fetchemploye();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill form and open modal for Edit
  const handleEdit = (row) => {
    console.log("row",row);
    
    setEditId(row.id);
    reset({
      name: row.name,
      email: row.email,
      phone: row.phone,
      department: row.department_id || row.department, // Ensure this maps to your row's data structure
      designation: row.designation,
      joining_date: row.joining_date ? row.joining_date.split('T')[0] : '',
      status: row.status,
      address: row.address,
    });
    setIsModalOpen(true);
  };

  // Handle Backend Deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axiosInstance.delete(`/api/employees/${id}`, {
          withCredentials: true,
        });
        fetchemploye(); // Refresh table after successful deletion
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img 
            src={`${IMAGE_BASE_URL}${row?.avatar}`}
            alt={row.name} 
            className="w-8 h-8 rounded-full object-cover bg-slate-100" 
          />
          <span className="font-medium text-slate-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'designation', label: 'Designation' },
    { key: 'phone', label: 'Phone' },
    { key: 'department_name', label: 'Department' },
   {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        // Keeping the z-50 fix we added earlier
        <div className={`relative inline-block font-bold tracking-tight text-left ${openDropdownId === row.id ? 'z-50' : 'z-auto'}`}>
          
          {/* Replaced '•••' with MoreVertical Icon */}
          <button
            onClick={() => toggleDropdown(row.id)}
            className="p-1.5 border border-gray-200 bg-white rounded-md text-gray-500 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
          >
            <MoreVertical size={16} />
          </button>

          {openDropdownId === row.id && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
              
              {/* Added Edit2 Icon */}
              <button
                onClick={() => {
                  handleEdit(row);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 size={14} className="text-gray-500" />
                Edit
              </button>

              {/* Added Trash2 Icon */}
              <button
                onClick={() => {
                  handleDelete(row.id);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} className="text-red-500" />
                Delete
              </button>
              
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div 
          onClick={() => {
            closeModal(); // Ensure form is clear before opening to Add
            setIsModalOpen(true);
          }} 
          className="inline-block mb-4 cursor-pointer"
        >
          <SubtleButton variant="custom">+ Add Employee</SubtleButton>
        </div>

        <DataTable
       
          title="Employee Directory"
          columns={tableColumns}
          data={employeeData}
        />
      </div>

      {/* --- Overlay Backdrop --- */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeModal}
      />

      {/* --- Right Side Drawer --- */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isModalOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {editId ? 'Edit Employee' : 'Add Employee'}
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
              
              {/* Full Name */}
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

              {/* Email Address */}
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

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Department (Dynamic) */}
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

              {/* Designation (Dynamic) */}
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

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Joining Date</label>
                <input
                  type="date"
                  {...register('joining_date', { required: 'Date is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
                />
              </div>

              {/* Employment Status */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Employment Status</label>
                <select 
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-600 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Address</label>
                <textarea
                  placeholder="Enter address"
                  rows="3"
                  {...register('address')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Profile Photo</label>
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

            {/* Drawer Footer / Actions */}
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
                {isSubmitting ? 'Saving...' : (editId ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}