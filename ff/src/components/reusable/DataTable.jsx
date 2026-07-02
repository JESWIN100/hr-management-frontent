import React, { useState } from 'react';

export function StatusBadge({ status }) {
  const styles = {
    Completed: 'bg-indigo-50 text-indigo-600',
    Reject: 'bg-red-50 text-red-500',
    Pending: 'bg-orange-50 text-orange-500',
  };

  const currentStyle = styles[status] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`px-3 py-1 rounded-md text-sm font-medium ${currentStyle}`}>
      {status}
    </span>
  );
}

export default function DataTable({
  title,
  columns = [],
  data = [],
  showControls = true,
}) {
  // 1. Add state for the search term
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Filter the data based on the search term
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true; // Show all if search is empty
    
    // Search through all the values in the row object (case-insensitive)
    return Object.values(row).some((value) => {
      if (value == null) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="w-full  bg-white border tracking-tight border-gray-200 rounded-xl shadow-sm">
      {/* Table Title */}
      {title && (
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
      )}

      {/* Controls Bar (Entries & Search) */}
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <select className="border border-gray-200 rounded-md px-3 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-500">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="w-full sm:w-auto relative">
            {/* 3. Bind the input to the searchTerm state */}
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 rounded-md px-4 py-1.5 text-sm w-full sm:w-64 outline-none focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>
      )}

      {/* Scrollable Table Container */}
      <div className="w-full overflow-x-auto overflow-y-auto h-full">
        <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50 border-b border-gray-200 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col text-[10px] leading-none text-slate-400">
                        <span>↑</span>
                        <span className="-mt-[2px]">↓</span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 4. Render filteredData instead of raw data */}
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-slate-700 border-b border-gray-100"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* Optional: Add a fallback state when no results match the search */
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-8 text-center text-sm text-slate-500"
                >
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}