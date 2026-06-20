import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../config/axiosInstance';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import Toast from '../components/reusable/Toast';


export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state: 'pending', 'approved', 'rejected', or 'all'
  const [activeFilter, setActiveFilter] = useState('pending');
  
  // Toast notification state
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '' });

  // Fetch all leave requests for HR
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Adjust endpoint to your actual backend admin route
      const response = await axiosInstance.get('/api/leave/requests'); 
      console.log(response);
      
      setRequests(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load leave requests. Please try again.");
      
     
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle Approve / Reject Actions
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      // Optimistic UI update: instantly remove/update it from the current view
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));

      // Make API Call
      await axiosInstance.put(`/api/leave/update-status/${requestId}`, {
        status: newStatus
      });

      // Show success toast
      setToast({
        isOpen: true,
        title: 'Status Updated',
        message: `Leave request has been ${newStatus}.`
      });

    } catch (err) {
      // Revert if failed
      console.error("Failed to update status:", err);
      fetchRequests(); 
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update leave status.'
      });
    }
  };

  // Filter the requests based on active tab
  const filteredRequests = requests.filter(req => {
    if (activeFilter === 'all') return true;
    return req.status?.toLowerCase() === activeFilter;
  });

  // UI Helper for Status Badges
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const filters = [
    { id: 'pending', label: 'Pending Requests' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All Requests' },
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[600px]">
      
      {/* Toast Notification */}
      <Toast 
        isOpen={toast.isOpen} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
        title={toast.title}
        timeAgo="Just now"
        message={toast.message}
        duration={4000} 
      />

      {/* Header & Filters */}
      <div className="border-b border-gray-100 bg-gray-50/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Leave Approvals</h2>
            <p className="text-sm text-gray-500 mt-1">Review and manage employee time-off requests.</p>
          </div>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-0">
        {error && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 flex items-center gap-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium text-lg">All caught up!</h3>
            <p className="text-gray-500 text-sm mt-1">No {activeFilter === 'all' ? '' : activeFilter} leave requests to show.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 pl-6 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Leave Details</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 pr-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Employee Info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {req.employee_name?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{req.employee_name}</p>
                          <p className="text-xs text-gray-500">{req.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Leave Type & Reason */}
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{req.leave_type}</p>
                      <p className="text-xs text-gray-500 max-w-[200px] truncate" title={req.reason}>
                        {req.reason}
                      </p>
                    </td>

                    {/* Dates */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(req.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                          {' - '} 
                          {new Date(req.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      {renderStatusBadge(req.status)}
                    </td>

                    {/* Actions (Only show buttons if pending) */}
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      {req.status?.toLowerCase() === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Reject Request"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-sm font-medium transition-colors border border-emerald-200 hover:border-emerald-600"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}