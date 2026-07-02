import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, MinusCircle, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { axiosInstance, IMAGE_BASE_URL } from '../config/axiosInstance';
import Toast from '../components/reusable/Toast'; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const years = [2022, 2023, 2024, 2025, 2026];

const STATUS_CYCLE = ['empty', 'present', 'absent', 'leave'];

export default function Attendence() {
  // ==========================================
  // 1. STATE VARIABLES
  // ==========================================
  
  // -- Tabs State --
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'daily', 'monthly'

  // -- Monthly Calendar State --
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [pendingUpdate, setPendingUpdate] = useState(null);
  const itemsPerPage = 10;

  // -- Daily Logs State --
  const [attendanceDatas, setAttendanceDatas] = useState([]);
  const [searchTerms, setSearchTerms] = useState('');
  const [logDateFilter, setLogDateFilter] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // -- UI State --
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    timeAgo: 'Just now'
  });

  // ==========================================
  // 2. EFFECTS & DATA FETCHING
  // ==========================================

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axiosInstance.get(`/api/attendance?month=${selectedMonth}&year=${selectedYear}`);
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      try {
        const res = await axiosInstance.get("/api/attendance/logs");
        
        const formattedData = res.data.map(log => {
          const loginDate = log.login_time ? new Date(log.login_time) : null;
          const logoutDate = log.logout_time ? new Date(log.logout_time) : null;

          const filterDate = loginDate ? 
            `${loginDate.getFullYear()}-${String(loginDate.getMonth() + 1).padStart(2, '0')}-${String(loginDate.getDate()).padStart(2, '0')}` 
            : '';

          let parsedSessions = [];
          try {
             const rawSessions = typeof log.session_details === 'string' ? JSON.parse(log.session_details) : log.session_details;
             
             parsedSessions = (rawSessions || []).map(s => ({
                 in: s.in ? new Date(s.in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                 out: s.out ? new Date(s.out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'
             }));
          } catch(e) {
             console.error("Failed to parse sessions", e);
          }

          const targetHours = log.working_hours ;
          const actualHours = Number(log?.total_duration_hours ?? 0)
          const pendingHours = Math.max(0, targetHours - actualHours);

          return {
            ...log,
            name: log.name || 'Unknown Employee', 
            loginRaw: log.login_time,
            logoutRaw: log.logout_time,
            loginDisplay: loginDate ? loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            logoutDisplay: logoutDate ? logoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            dateDisplay: log.date ? new Date(log.date).toLocaleDateString() : '-',
            filterDate,
            actualDurationDisplay: Number.isFinite(actualHours) && actualHours > 0 ? `${actualHours.toFixed(1)}h` : "0h",
            targetHoursDisplay: `${Number(targetHours).toFixed(1)}h`,
            pendingDisplay: pendingHours > 0 ? `${pendingHours.toFixed(1)}h` : '0h',
            hasPending: pendingHours > 0,
            formattedSessions: parsedSessions
          };
        });
        
        setAttendanceDatas(formattedData);
      } catch (err) {
        console.error("Error fetching attendance logs:", err);
      }
    };
    fetchAttendanceLogs();
  }, []);

  // ==========================================
  // 3. COMPUTED & MEMOIZED VALUES
  // ==========================================

  const filteredData = useMemo(() => {
    return attendanceData.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, attendanceData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const averageDuration = useMemo(() => {
    const totalHours = attendanceDatas.reduce((acc, curr) => {
      if (!curr.login || !curr.logout) return acc;
      const start = new Date(`01/01/2024 ${curr.login}`);
      const end = new Date(`01/01/2024 ${curr.logout}`);
      return acc + ((end - start) / (1000 * 60 * 60));
    }, 0);

    return attendanceDatas.length
      ? (totalHours / attendanceDatas.length).toFixed(1)
      : 0;
  }, [attendanceDatas]);

  // ==========================================
  // 4. HANDLERS & HELPERS
  // ==========================================

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

// 1. This function is called when the user clicks the attendance cell
  const handleStatusChangeClick = (employeeId, dayIndex, currentStatus) => {
    // Save the details of what we are trying to update
    setPendingUpdate({ employeeId, dayIndex, currentStatus });
    // Open the custom modal
    setIsConfirmModalOpen(true);
  };

  // 2. This function is called when the user clicks "Confirm" inside the custom modal
  const confirmUpdate = async () => {
    if (!pendingUpdate) return;
    
    const { employeeId, dayIndex, currentStatus } = pendingUpdate;

    // Close the modal and clear the pending state immediately
    setIsConfirmModalOpen(false);
    setPendingUpdate(null);

    // Calculate next status
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    // Optimistically update the UI
    setAttendanceData(prevData => 
      prevData.map(emp => {
        if (emp.id === employeeId) {
          const updatedRecords = [...emp.records];
          updatedRecords[dayIndex] = nextStatus;
          return { ...emp, records: updatedRecords };
        }
        return emp;
      })
    );

    // Make the API call
    try {
      await axiosInstance.put('/api/attendance/update', {
        employeeId,
        year: selectedYear,
        month: selectedMonth,
        day: dayIndex + 1,
        status: nextStatus
      });

      setToast({
        isOpen: true,
        title: 'Success',
        message: 'Attendance record updated successfully.',
        timeAgo: 'Just now'
      });
    } catch (error) {
      console.error("Failed to update status on server:", error);
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update attendance on the server.',
        timeAgo: 'Just now'
      });
    }
  };

  // 3. This function is called when the user clicks "Cancel" inside the custom modal
  const cancelUpdate = () => {
    setIsConfirmModalOpen(false);
    setPendingUpdate(null);
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="w-5 h-5 text-blue-500 bg-white rounded-full" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-500 bg-white rounded-full" />;
      case 'leave': return <MinusCircle className="w-5 h-5 text-amber-500 bg-white rounded-full" />;
      case 'empty': return <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-white" />;
      default: return <div className="w-5 h-5" />;
    }
  };

  const renderStatus = (status) => {
    const styles = {
      present: "text-green-600 bg-green-50 border-green-200",
      absent: "text-red-600 bg-red-50 border-red-200",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const [chartStats, setChartStats] = useState({ areaChartData: [], heatmapData: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(`/api/attendance/chart?year=${selectedYear}`);
        setChartStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [selectedYear]);

  // ==========================================
  // 5. RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      
      {/* Master Card with Inner Folder Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-3rem)]">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-4 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 font-medium text-sm rounded-t-lg transition-colors border ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 border-gray-200 border-b-transparent -mb-[1px] z-10'
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-2.5 font-medium text-sm rounded-t-lg transition-colors border ${
              activeTab === 'daily'
                ? 'bg-white text-blue-600 border-gray-200 border-b-transparent -mb-[1px] z-10'
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            Daily Logs
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-2.5 font-medium text-sm rounded-t-lg transition-colors border ${
              activeTab === 'monthly'
                ? 'bg-white text-blue-600 border-gray-200 border-b-transparent -mb-[1px] z-10'
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            Monthly Calendar
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* --- TAB 1: DASHBOARD CHARTS --- */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-6">Average Online Hours</h2>
                <div className="h-64 w-full border border-gray-100 rounded-lg p-4 bg-gray-50/30">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartStats.areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="hours" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: DAILY LOGS TABLE --- */}
          {activeTab === 'daily' && (
            <div className="flex flex-col space-y-4 h-full">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="font-semibold text-gray-700">Daily Attendance Logs</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input 
                    type="date"
                    value={logDateFilter}
                    onChange={(e) => setLogDateFilter(e.target.value)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={searchTerms}
                    onChange={(e) => setSearchTerms(e.target.value)}
                    className="w-full sm:w-64 pl-4 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Sessions (In - Out)</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Actual Worked</th>
                      <th className="px-6 py-4">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceDatas
                      .filter(item => item.name.toLowerCase().includes(searchTerms.toLowerCase()))
                      .filter(item => logDateFilter ? item.filterDate === logDateFilter : true)
                      .map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          {row.avatar ? (
                              <img src={`${IMAGE_BASE_URL}${row.avatar}`} alt={row.name} className="w-8 h-8 rounded-full object-cover"/>
                          ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                  {row.name.charAt(0)}
                              </div>
                          )}
                          <span className="font-medium text-gray-700">{row.name}</span>
                        </td>
                        <td className="px-6 py-4">{renderStatus(row.status)}</td>
                        
                        <td className="px-6 py-4 text-gray-500 text-xs relative group cursor-pointer">
                          <div>In: {row.loginDisplay}</div>
                          <div>Out: {row.logoutDisplay}</div>
                          
                          {row.session_count > 1 && (
                              <span className="text-[10px] text-blue-500 font-medium underline decoration-dashed underline-offset-2">
                                ({row.session_count} sessions)
                              </span>
                          )}

                          {row.formattedSessions && row.formattedSessions.length > 0 && (
                              <div className="absolute left-4 bottom-full mb-1 hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl min-w-[160px]">
                                  <div className="font-semibold mb-2 border-b border-gray-600 pb-1 text-gray-300">
                                      Session Breakdown
                                  </div>
                                  <ul className="space-y-1.5">
                                      {row.formattedSessions.map((session, idx) => (
                                          <li key={idx} className="flex justify-between items-center gap-4">
                                              <span className="text-gray-400">In: <span className="text-white font-medium">{session.in}</span></span>
                                              <span className="text-gray-400">Out: <span className="text-white font-medium">{session.out}</span></span>
                                          </li>
                                      ))}
                                  </ul>
                                  <div className="absolute left-4 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                              </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{row.targetHoursDisplay}</td>
                        <td className="px-6 py-4 font-semibold text-blue-600">{row.actualDurationDisplay}</td>
                        <td className={`px-6 py-4 font-bold ${row.hasPending ? 'text-red-500' : 'text-green-500'}`}>{row.pendingDisplay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB 3: MONTHLY CALENDAR TABLE --- */}
          {activeTab === 'monthly' && (
            <div className="flex flex-col space-y-4 h-full relative z-0">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="font-semibold text-gray-700">Monthly Attendance Calendar</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input 
                      type="text" 
                      placeholder="Search employee..." 
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-4 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="relative flex-1 sm:flex-none">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      {months.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1 sm:flex-none">
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-auto relative rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left whitespace-nowrap select-none">
                  <thead className="sticky top-0 z-20 bg-gray-50 backdrop-blur-sm text-gray-600 border-b border-gray-200 text-xs font-medium">
                    <tr>
                      <th className="sticky left-0 top-0 z-30 bg-gray-50 px-6 py-4 font-semibold min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-gray-200">
                        <div className="flex items-center gap-1">Employee Name</div>
                      </th>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                        <th key={day} className="px-2 py-4 text-center min-w-[40px] border-b border-gray-200">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white px-6 py-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-3">
                              <img
                                src={`${IMAGE_BASE_URL}${employee?.avatar}`}
                                alt={employee.name}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                              <span className="font-medium text-gray-700">{employee.name}</span>
                            </div>
                          </td>
                          
                          {employee.records.slice(0, daysInMonth).map((status, index) => (
                            <td 
                              key={index} 
                              className="px-2 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
                              onClick={() => handleStatusChangeClick(employee.id, index, status || 'empty')}
                            >
                              <div className="flex justify-center items-center">
                                {renderStatusIcon(status || 'empty')}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={daysInMonth + 1} className="px-6 py-8 text-center text-gray-500">
                          No employees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between py-4 text-sm text-gray-500 gap-4">
                <div>
                  Showing {filteredData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="flex items-center gap-1">
                  {/* Pagination buttons can go here */}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
{/* Custom Confirmation Modal */}
{isConfirmModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-4">Confirm Update</h2>
      <p className="text-gray-600 mb-6">
        Are you sure you want to update this attendance record?
      </p>
      
      <div className="flex justify-end space-x-3">
        <button 
          onClick={cancelUpdate}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={confirmUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

      <Toast 
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        timeAgo={toast.timeAgo}
        duration={4000}
      />
    </div>
  );
}