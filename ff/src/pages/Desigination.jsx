import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'; // Added Lucide Icons
import DataTable from '../components/reusable/DataTable';
import SubtleButton from '../components/reusable/SubtleButton';
import { axiosInstance } from '../config/axiosInstance';
import { usePrivileges } from '../context/PrivilegeContext';

export default function Designation() {
  // Modal & Dropdown state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [designationData, setDesignationData] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

const { canPerform } = usePrivileges(); 
  const MENU_NAME = 'designation';


  // Edit & Submit state
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchdesignation = async () => {
    try {
      const res = await axiosInstance.get("/api/designations", {
        withCredentials: true
      });
      
      const rawData = res.data.data || res.data; // Added fallback

      const dataWithSl = rawData.map((item, index) => ({
        ...item,
        sl: index + 1 
      }));

      setDesignationData(dataWithSl);
      
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  useEffect(() => {
    fetchdesignation();
  }, []);

  // Helper to close modal and reset form state cleanly
  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setOpenDropdownId(null);
    reset({
      designationName: '',
      reportTo: ''
    }); // Clears the form fields
  };

  // Pre-fill form and open modal for Edit
  const handleEdit = (row) => {
    setEditId(row.id); // Assuming your DB primary key is 'id'
    reset({
      designationName: row.designation_name,
      reportTo: row.report_to,
    });
    setIsModalOpen(true);
  };

  // Handle Backend Deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        await axiosInstance.delete(`/api/designations/${id}`, {
          withCredentials: true,
        });
        fetchdesignation(); // Refresh table after successful deletion
      } catch (error) {
        console.error('Failed to delete designation:', error);
      }
    }
  };

  // Form submission handler (Create & Update)
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Mapping the form data to match backend snake_case expectations
      const payload = {
        designation_name: data.designationName,
        report_to: data.reportTo,
      };

      if (editId) {
        // Update API call
        await axiosInstance.put(`/api/designations/edit/${editId}`, payload, {
          withCredentials: true
        });
      } else {
        // Create API call
        await axiosInstance.post("/api/designations", payload, {
          withCredentials: true
        });
      }

      // On success: close drawer, clear form, and refresh table
      closeModal();
      fetchdesignation();
    } catch (error) {
      console.error("Error saving designation:", error);
      // Optional: Add toast notifications here
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  const tableColumns = [
    { key: 'sl', label: 'SL' },
    { key: 'report_to', label: 'Report To' },
    { key: 'designation_name', label: 'Designation' },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => {

        const hasEditPerm = canPerform(MENU_NAME, 'edit');
    const hasDeletePerm = canPerform(MENU_NAME, 'delete');

   
    if (!hasEditPerm && !hasDeletePerm) return <span className="text-gray-400 text-xs">None</span>;
    return(
        <div className={`relative inline-block text-left ${openDropdownId === row.id ? 'z-50' : 'z-auto'}`}>
          <button
            onClick={() => toggleDropdown(row.id)}
            className="p-1.5 border border-gray-200 bg-white rounded-md text-gray-500 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
          >
            <MoreVertical size={16} />
          </button>

          {openDropdownId === row.id && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
             {hasEditPerm && (
              <>
                
                <button onClick={() => handleEdit(row)}>Edit</button>
              </>
            )}
            {hasDeletePerm && (
              <button onClick={() => handleDelete(row.id)}>Delete</button>
            )}
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
    )
      },
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {/* Add Designation Button */}
       {canPerform(MENU_NAME, 'create') && (
  <div onClick={() => { closeModal(); setIsModalOpen(true); }} className="inline-block mb-4 cursor-pointer">
    <SubtleButton variant="custom">+ Add Record</SubtleButton>
  </div>
)}

        <DataTable
          title="Designation Directory"
          columns={tableColumns}
          data={designationData}
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
        {/* Drawer Header (Fixed at top) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {editId ? 'Edit Designation' : 'Add Designation'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Drawer Body / Form (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-5">
              
              {/* Designation Name */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Designation Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  {...register("designationName", { required: "Designation name is required" })}
                />
                {errors.designationName && (
                  <p className="text-red-500 text-xs mt-1">{errors.designationName.message}</p>
                )}
              </div>

              {/* Report To (Select) */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Report To
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
                  {...register("reportTo", { required: "Please select who this role reports to" })}
                >
                  <option value="">Select Manager / Head</option>
                  <option value="James Anderson">James Anderson</option>
                  <option value="Michael Davis">Michael Davis</option>
                  <option value="Matthew Taylor">Matthew Taylor</option>
                  <option value="Sarah Connor">Sarah Connor</option>
                  <option value="Robert King">Robert King</option>
                </select>
                {errors.reportTo && (
                  <p className="text-red-500 text-xs mt-1">{errors.reportTo.message}</p>
                )}
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