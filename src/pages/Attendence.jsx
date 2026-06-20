import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, MinusCircle, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { axiosInstance, IMAGE_BASE_URL } from '../config/axiosInstance';

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const years = [2022, 2023, 2024, 2025, 2026];

// Define the cycle order for clicking a cell
const STATUS_CYCLE = ['empty', 'present', 'absent', 'leave'];

export default function Attendence() {
  // --- State Variables ---
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Fetch Data from Backend ---
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axiosInstance.get(`/api/attendance?month=${selectedMonth}&year=${selectedYear}`);
        setAttendanceData(response.data);
        console.log(response.data);
        
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  // --- Handle Clicking a Cell ---
  const handleStatusChange = async (employeeId, dayIndex, currentStatus) => {
    // 1. Determine the next status in the cycle
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    // 2. Optimistically update the UI instantly
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

    // 3. Send the update to your backend
    try {
      await axiosInstance.put('/api/attendance/update', {
        employeeId,
        year: selectedYear,
        month: selectedMonth,
        day: dayIndex + 1, // dayIndex is 0-based (0 = 1st of the month)
        status: nextStatus
      });
    } catch (error) {
      console.error("Failed to update status on server:", error);
      // Optional: If it fails, you might want to revert the local state back here
    }
  };

  // Filter and paginate data
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // --- Render Icons based on status ---
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-5 h-5 text-blue-500 bg-white rounded-full" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500 bg-white rounded-full" />;
      case 'leave':
        return <MinusCircle className="w-5 h-5 text-amber-500 bg-white rounded-full" />; // Added Leave Status
      case 'empty':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-white" />; // Made empty state a clickable ring
      default:
        return <div className="w-5 h-5" />; // Fallback
    }
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  return (
    <div className="min-h-full bg-gray-50 font-sans">
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm relative z-0">
        
        {/* --- Filters & Search Bar --- */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-tr-xl">
          <p className="font-semibold text-gray-700">Daily Attendance</p>

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

        {/* --- Table Container --- */}
        <div className="overflow-auto max-h-[400px] relative">
          <table className="w-full text-sm text-left whitespace-nowrap select-none">
            
            <thead className="sticky top-0 z-20 bg-blue-50/95 backdrop-blur-sm text-gray-600 border-b border-gray-200 text-xs font-medium">
              <tr>
                <th className="sticky left-0 top-0 z-30 bg-blue-50 px-6 py-4 font-semibold min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-gray-200">
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
                          // src={employee.avatar}
                          src={`${IMAGE_BASE_URL}${employee?.avatar}`}
                          alt={employee.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <span className="font-medium text-gray-700">{employee.name}</span>
                      </div>
                    </td>
                    
                    {/* Make these cells clickable */}
                    {employee.records.slice(0, daysInMonth).map((status, index) => (
                      <td 
                        key={index} 
                        className="px-2 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleStatusChange(employee.id, index, status || 'empty')}
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

        {/* --- Footer / Pagination --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-500 gap-4">
          <div>
            Showing {filteredData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 border border-transparent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 border border-transparent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded hover:bg-gray-100 border border-transparent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded hover:bg-gray-100 border border-transparent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}