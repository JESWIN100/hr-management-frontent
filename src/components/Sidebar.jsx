import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/', 
      end: true, 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      path: '/employee', 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' 
    },
    { 
      id: 'department', 
      label: 'Department', 
      path: '/department', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
    { 
      id: 'desigination', 
      label: 'Designation', 
      path: '/desigination', 
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
    },
    { 
      id: 'marketing', 
      label: 'Marketing', 
      path: '/marketing', 
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
    },
    { 
      id: 'attendence', 
      label: 'Attendence', 
      path: '/attendence', 
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
    }
  ];

  return (
    <>
      {/* Overlay: Kept dark to contrast with the sidebar when open on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Glassmorphism Background Update: 
        Using a deep violet/purple with opacity (bg-[#2D1B4E]/90) and backdrop-blur 
      */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 min-w-64 bg-[#2D1B4E]/90 backdrop-blur-xl text-white border-r border-white/10 flex flex-col h-full transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0`}
      >
        
        {/* Toggle Button: Updated to match the dark glass theme */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-10 top-16 bg-[#2D1B4E] text-white border border-white/10 border-l-0 p-2 rounded-r-lg md:hidden flex items-center justify-center shadow-[4px_0_10px_rgba(0,0,0,0.2)] focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <svg 
            className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Header styling updated for dark theme */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-white">HR Core</h1>
          <p className="text-xs text-gray-400 mt-1">Management Portal</p>
        </div>
        
        {/* Navigation Links updated for dark glassmorphism */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              onClick={() => setIsOpen(false)} 
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm' // Active state: Translucent white bg, solid text
                    : 'text-gray-300 hover:bg-white/5 hover:text-white' // Inactive state: Dim text, slight glow on hover
                }`
              }
            >
              <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className='font-bold tracking-tight'>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Create New Button (Matching the bright purple button in the image) */}
        {/* <div className="p-4">
            <button className="w-full bg-[#8A2BE2] hover:bg-[#9B4DFF] text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New</span>
            </button>
        </div> */}

        {/* Footer styling updated for dark theme */}
        <div className="p-4 border-t border-white/10">
          <Link 
            to="/login" 
            className="flex items-center space-x-3 w-full px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm">
              HR
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">HR Admin</p>
              <p className="text-xs text-gray-400">Logout</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}