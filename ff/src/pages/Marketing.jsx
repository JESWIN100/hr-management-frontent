import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from './../config/axiosInstance';
import Toast from '../components/reusable/Toast';
import { useNavigate } from 'react-router-dom';
import { usePrivileges } from '../context/PrivilegeContext';
export default function ClientVisitTracker() {
  // UI State for tabs
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();



  const { canPerform } = usePrivileges(); // 🆕 Added
  const MENU_NAME = 'marketing';
  // --- TOAST STATE ---
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // --- DYNAMIC OPTIONS STATE ---
  const [leadTypes, setLeadTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
const [feasibilityOptions, setFeasibilityOptions] = useState([]);
  // React Hook Form setup
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      clientName: '',
      lead_type_id: '', // Changed to empty string to enforce selection if needed
      status_id: '',
      visitDate: '',
      purposeOfVisit: '',
      work_feasibility_id: '',
      clientRemarks: '',
      clientPreferredTime: '',
      nextMeetingDate: ''
    }
  });

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Replace these URLs with your actual backend endpoints
        const [leadTypeRes, statusRes,feasibilityRes] = await Promise.all([
          axiosInstance.get('/api/leadTypes'),
          axiosInstance.get('/api/status'),
          axiosInstance.get('/api/status/workfesability')
        ]);
        console.log(leadTypeRes, statusRes);
        
        
        setLeadTypes(leadTypeRes.data.data); 
        setStatuses(statusRes.data.data);
        setFeasibilityOptions(feasibilityRes.data.data);
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        setToast({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load form options.'
        });
      }
    };

    fetchDropdownData();
  }, []);

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post('/api/marketing/add', data);
      console.log(response);
      
      setToast({
        isOpen: true,
        title: 'Success',
        message: 'Record saved successfully!'
      });
      
      reset(); 
      setActiveTab('details'); 
      
    } catch (error) {
      console.error('Error saving record:', error);
      setToast({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.error || 'Failed to save the record.'
      });
    }
  };

  const closeToast = () => setToast(prev => ({ ...prev, isOpen: false }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto p-6 bg-gray-50 min-h-screen relative">
      
      <Toast 
        isOpen={toast.isOpen} 
        onClose={closeToast} 
        title={toast.title} 
        message={toast.message} 
        timeAgo="Just now" 
      />

      {/* Page Header */}
      <div className="mb-6 flex justify-end items-end">
        <div className="flex gap-3">
           {/* <button 
             type="button" 
             onClick={() => navigate("/clientvisit")} 
             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
           >
             View
           </button> */}
           {canPerform(MENU_NAME, 'create') && (
           <button 
             type="submit" 
             disabled={isSubmitting}
             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
           >
             {isSubmitting ? 'Saving...' : 'Save Record'}
           </button>
           )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Top Section: Permanent Key Identifiers */}
        <div className="p-6 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between bg-gray-50">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., Apex Industries"
              className={`w-full bg-white border ${errors.clientName ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              {...register('clientName', { required: 'Client Name is required' })}
            />
            {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}
          </div>
          
          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lead Type</label>
            <select 
              className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              {...register('lead_type_id')}
            >
              <option value="" disabled>Select Type</option>
              {leadTypes.map((type, index) => (
               
                <option key={index} value={type.id}>
                  {type.status_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
            <select 
              className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              {...register('status_id')}
            >
              <option value="" disabled>Select Status</option>
              {statuses.map((statusItem, index) => (
                // Modify this map if your API returns objects instead of strings
                <option key={index} value={statusItem.id}>
                  {statusItem.status_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Folder Tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-100/50 px-4 pt-4">
          <button 
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-6 py-2.5 text-sm font-medium rounded-t-md border-t border-l border-r transition-colors ${
              activeTab === 'details' 
                ? 'bg-white text-blue-600 border-gray-200 -mb-px relative z-10' 
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Visit Details
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('communication')}
            className={`px-6 py-2.5 text-sm font-medium rounded-t-md border-t border-l border-r transition-colors ${
              activeTab === 'communication' 
                ? 'bg-white text-blue-600 border-gray-200 -mb-px relative z-10' 
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Notes & Remarks
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('followup')}
            className={`px-6 py-2.5 text-sm font-medium rounded-t-md border-t border-l border-r transition-colors ${
              activeTab === 'followup' 
                ? 'bg-white text-blue-600 border-gray-200 -mb-px relative z-10' 
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Scheduling
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 relative z-0">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Visit</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  {...register('visitDate')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Feasibility</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  {...register('work_feasibility_id')}
                >
                  <option value="" disabled>Select Feasibility</option>
                  {feasibilityOptions.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.status_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                <textarea 
                  rows="3" 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Initial site inspection, custom panel board dimensions, or quoting..."
                  {...register('purposeOfVisit')}
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNICATION */}
          {activeTab === 'communication' && (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Remarks</label>
                <textarea 
                  rows="4" 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What did the client say? Specific requirements, budget constraints..."
                  {...register('clientRemarks')}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time/Date Stated</label>
                <input 
                  type="text" 
                  placeholder="e.g., Weekdays after 3 PM"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  {...register('clientPreferredTime')}
                />
              </div>
            </div>
          )}

          {/* TAB 3: FOLLOW UP */}
          {activeTab === 'followup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Scheduled Meeting Date</label>
                <input 
                  type="datetime-local" 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  {...register('nextMeetingDate')}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </form>
  );
}