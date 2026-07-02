import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { axiosInstance } from '../config/axiosInstance';

const monthsList = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];
const years = [2022, 2023, 2024, 2025, 2026];

// Fixed 31 days for the column headers
const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

export default function EmployeeAnnualAttendance() {
  const currentDate = new Date();
  
  // State for Year filter (Month is removed)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Store yearly data. Expected format: { 1: ['present', 'absent', ...], 2: [...], ... }
  const [yearlyData, setYearlyData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const employeeId = 32; 

  // Fetch data for the entire year
  useEffect(() => {
    const fetchYearlyAttendance = async () => {
      setIsLoading(true);
      try {
        // Update your backend to accept just the year and return all 12 months for this employee
        const response = await axiosInstance.get(
          `/api/attendance/employee/${employeeId}/yearly?year=${selectedYear}`
        );
        console.log(response.data);
        
        setYearlyData(response.data || {});
      } catch (error) {
        console.error("Error fetching yearly attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYearlyAttendance();
  }, [selectedYear, employeeId]); 

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-4 h-4 text-blue-500 bg-white rounded-full mx-auto" title="Present" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500 bg-white rounded-full mx-auto" title="Absent" />;
      case 'empty':
        return <CheckCircle2 className="w-4 h-4 text-gray-200 bg-white rounded-full mx-auto" title="No Data" />;
      default:
        return <span className="text-gray-400 text-[10px] block text-center">-</span>;
    }
  };

  return (
    <div className="min-h-full bg-gray-50 font-sans p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-0">
        
        {/* --- Header & Year Filter (Month removed) --- */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-xl">
          <p className="font-semibold text-gray-700">My Annual Attendance</p>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Year Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full sm:w-32 appearance-none pl-4 pr-8 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Table Container --- */}
        <div className="overflow-auto relative rounded-b-xl max-h-[600px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            
            {/* Table Header */}
            <thead className="sticky top-0 z-20 bg-blue-50/95 backdrop-blur-sm text-gray-600 border-b border-gray-200 text-xs font-medium">
              <tr>
                <th className="sticky left-0 top-0 z-30 bg-blue-50 px-6 py-4 font-semibold min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-gray-200">
                  Month
                </th>
                {/* Render Days (1 to 31) fixed at the top */}
                {daysArray.map((day) => (
                  <th key={day} className="px-2 py-4 text-center min-w-[40px] border-b border-gray-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={32} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading attendance for {selectedYear}...
                    </div>
                  </td>
                </tr>
              ) : (
                // Map through all 12 months to create the rows
                monthsList.map((month) => {
                  // Calculate how many days are actually in this specific month/year
                  const daysInThisMonth = new Date(selectedYear, month.value, 0).getDate();
                  
                  // Get the records array for this specific month from your API data
                  const monthRecords = yearlyData[month.value] || [];

                  return (
                    <tr key={month.value} className="hover:bg-gray-50/50 transition-colors">
                      {/* Left Column: Month Name */}
                      <td className="sticky left-0 z-10 bg-white px-6 py-3 font-medium text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {month.label}
                      </td>
                      
                      {/* Days Columns */}
                      {daysArray.map((day, index) => {
                        // If the column day (e.g., 31) doesn't exist in this month (e.g., Feb or April), gray it out
                        if (day > daysInThisMonth) {
                          return (
                            <td key={index} className="px-2 py-3 bg-gray-50/50">
                              {/* Empty/Invalid day cell */}
                            </td>
                          );
                        }

                        return (
                          <td key={index} className="px-2 py-3">
                            {monthRecords[index] !== undefined 
                              ? renderStatusIcon(monthRecords[index]) 
                              : renderStatusIcon('empty')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}