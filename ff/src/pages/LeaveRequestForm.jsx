import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../config/axiosInstance';
import { 
  Calendar, 
  Send, 
  CheckCircle, 
  Clock, 
  History, 
  AlertCircle
} from 'lucide-react';
import Toast from '../components/reusable/Toast';




export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState('request'); 

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  
  const [formStatus, setFormStatus] = useState({ loading: false, error: null, success: false });

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [historyStatus, setHistoryStatus] = useState({ loading: false, error: null });

  const employeeId = 32; 

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axiosInstance.get('/api/status/leavestatus'); 
        setLeaveTypes(response.data.data);
      } catch (error) {
        console.error("Failed to fetch leave types:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null, success: false });

    try {
      await axiosInstance.post('/api/leave/request', {
        employee_id: employeeId,
        ...formData
      });
      
      // We removed the setTimeout here because the Toast component handles its own timer!
      setFormStatus({ loading: false, error: null, success: true });
      setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' }); 
      
    } catch (error) {
      setFormStatus({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to submit request', 
        success: false 
      });
    }
  };

  const fetchLeaveHistory = async () => {
    setHistoryStatus({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/api/leave/history/${employeeId}`);
      setLeaveHistory(response.data);
      setHistoryStatus({ loading: false, error: null });
    } catch (error) {
      setHistoryStatus({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to load leave history' 
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchLeaveHistory();
    }
  }, [activeTab]);

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
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
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

  const tabs = [
    { id: 'request', label: 'Request Leave', icon: Calendar },
    { id: 'history', label: 'Leave History', icon: History },
  ];

  return (
    // Make sure relative is on the parent or body if needed, but fixed positioning on the Toast will usually attach to the window.
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto relative">
      
      {/* --- NEW: The Toast Notification --- */}
      <Toast 
        isOpen={formStatus.success} 
        onClose={() => setFormStatus(prev => ({ ...prev, success: false }))} 
        title="Leave Request"
        timeAgo="Just now"
        message="Leave request submitted successfully!"
        duration={3000} 
      />

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/80 px-4 pt-4 scrollbar-hide">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8 min-h-[400px]">
        {/* --- TAB CONTENT: REQUEST LEAVE --- */}
        {activeTab === 'request' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
              <p className="text-sm text-gray-500 mt-1">Submit your time-off request for manager approval.</p>
            </div>

            {/* Error Message is left inline, but you could make this a Toast later too! */}
            {formStatus.error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 flex items-center gap-3 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <p className="font-medium text-sm">{formStatus.error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    min={formData.start_date}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                 
                 <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Leave Type
                  </label>
                  <select
                    name="leave_type_id"
                    value={formData.leave_type_id}
                    onChange={handleChange}
                    required
                    disabled={loadingTypes}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      {loadingTypes ? 'Loading types...' : 'Select Leave Type'}
                    </option>
                    
                    {leaveTypes.map((type) => (
                      <option 
                        key={type.id || type.name} 
                        value={type.id } 
                      >
                        {type.status_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Reason for Leave
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Please provide details about your leave..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formStatus.loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all disabled:opacity-70 shadow-sm shadow-blue-200"
              >
                {formStatus.loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB CONTENT: LEAVE HISTORY --- */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
                <p className="text-sm text-gray-500 mt-1">View your past and pending leave requests.</p>
              </div>
              <button 
                onClick={fetchLeaveHistory}
                className="text-sm flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium py-1.5 px-3 rounded-lg transition-colors"
              >
                <History className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {historyStatus.error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm">
                <p>{historyStatus.error}</p>
              </div>
            )}

            {historyStatus.loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : leaveHistory.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                  <History className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">No history found</h3>
                <p className="text-gray-500 text-sm mt-1">You haven't made any leave requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-semibold">Start Date</th>
                      <th className="p-4 font-semibold">End Date</th>
                      <th className="p-4 font-semibold">Reason</th>
                      <th className="p-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {leaveHistory.map((leave, index) => (
                      <tr key={leave.id || index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm text-gray-800 font-medium whitespace-nowrap">
                          {new Date(leave.start_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-gray-800 whitespace-nowrap">
                          {new Date(leave.end_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                          {leave.reason}
                        </td>
                        <td className="p-4 whitespace-nowrap text-right">
                          {renderStatusBadge(leave.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}