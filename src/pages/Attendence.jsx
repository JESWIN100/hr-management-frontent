import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Calendar } from 'lucide-react';

// --- Expanded Dummy Data Setup ---
const baseEmployees = [
  { id: 1, name: 'James Anderson', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'William Johnson', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Benjamin Martinez', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Michael Davis', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'Matthew Taylor', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, name: 'David Wilson', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 7, name: 'Anthony Thomas', avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 8, name: 'Christopher Moore', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 9, name: 'Emma Smith', avatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 10, name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 11, name: 'Sophia Miller', avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 12, name: 'Liam Garcia', avatar: 'https://i.pravatar.cc/150?u=12' },
];

const generateAttendance = () => {
  return Array.from({ length: 31 }, () => {
    const rand = Math.random();
    if (rand > 0.85) return 'absent';
    if (rand > 0.75) return 'empty';
    return 'present';
  });
};

const attendanceData = baseEmployees.map(emp => ({
  ...emp,
  records: generateAttendance()
}));

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const years = [2022, 2023, 2024, 2025, 2026];

export default function Attendence() {
  const [activeTab, setActiveTab] = useState('attendance');
  
  // New State variables for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-5 h-5 text-blue-500 bg-white rounded-full" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500 bg-white rounded-full" />;
      case 'empty':
        return <CheckCircle2 className="w-5 h-5 text-gray-300 bg-white rounded-full" />;
      default:
        return null;
    }
  };

  // Simulate days in the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  return (
    <div className="min-h-full bg-gray-50  font-sans">
      
    

      {/* Main Content Card */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm relative z-0">
        
        {/* --- Filters & Search Bar --- */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-tr-xl">
          
   <p>Daily Attendance</p>

          
          {/* Search */}
          {/* <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div> */}

          {/* Date Filters */}
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
                 <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

        {/* --- Table Container (Vertical & Horizontal Scroll) --- */}
        <div className="overflow-auto max-h-[400px] relative">
          <table className="w-full text-sm text-left whitespace-nowrap">
            
            {/* Table Header */}
            <thead className="sticky top-0 z-20 bg-blue-50/95 backdrop-blur-sm text-gray-600 border-b border-gray-200 text-xs font-medium">
              <tr>
                {/* Top-Left Corner cell needs z-30 to stay above both left-scroll and down-scroll */}
                <th className="sticky left-0 top-0 z-30 bg-blue-50 px-6 py-4 font-semibold min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-gray-200">
                  <div className="flex items-center gap-1">
                    Employee Name 
                    <span className="text-gray-400 text-[10px]">↑↓</span>
                  </div>
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <th key={day} className="px-2 py-4 text-center min-w-[40px] border-b border-gray-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Sticky First Column */}
                    <td className="sticky left-0 z-10 bg-white px-6 py-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <span className="font-medium text-gray-700">{employee.name}</span>
                      </div>
                    </td>
                    {/* Attendance Days */}
                    {employee.records.slice(0, daysInMonth).map((status, index) => (
                      <td key={index} className="px-2 py-3">
                        <div className="flex justify-center items-center">
                          {renderStatusIcon(status)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={daysInMonth + 1} className="px-6 py-8 text-center text-gray-500">
                    No employees found matching "{searchTerm}"
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
            
            {/* Page Numbers */}
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