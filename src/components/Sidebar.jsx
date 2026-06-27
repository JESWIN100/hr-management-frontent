import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { axiosInstance } from '../config/axiosInstance';
import { usePrivileges } from '../context/PrivilegeContext';

// Local dictionary to map backend "name" properties to their respective paths and icons
const menuConfig = {
  dashboard: { 
    path: '/', 
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
  },
  employee: { 
    path: '/employee', 
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' 
  },
  department: { 
    path: '/department', 
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
  },
  designation: { 
    path: '/designation', 
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
  },
  marketing: { 
    path: '/marketing', 
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
  },
  // attendance: { // Fixed typo from 'attendence' to match router setup
  //   path: '/attendence', 
  //   icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
  // },
  // leaverequest: { 
  //   path: '/leaverequest', 
  //   icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
  // },


attendance: {
    path: '/attendence', // matches Route path
    icon: '...'
  },

  leaverequest: {
    path: '/leaverequest',
    icon: '...'
  },

  leave_approval: {
    path: '/leaveapproval',
    icon: '...'
  },

  client_visits: {
    path: '/clientvisit',
    icon: '...'
  },
  task_management: {
    path: '/projects',
    icon: '...'
  },

  settings: {
    path: '#',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  },
  privileges: { // Fixed key name from 'privilege' to match menuName="privileges"
    path: '/settings/privilege/table' 
  }
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [navItems, setNavItems] = useState([]); 
  const [openDropdownId, setOpenDropdownId] = useState(null); 



  const { allowedMenuNames,isAdmin, isLoading } = usePrivileges(); // ← use context

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const response = await axiosInstance('/api/previlage/menu');
        const rawData = response.data.data || [];

        const formattedStructure = [];
        const itemMap = {};

        rawData.forEach((item) => {
          itemMap[item.id] = {
            id: item.id,
            label: item.caption,
            name: item.name,
            path: menuConfig[item.name]?.path || `/${item.name}`,
            icon: menuConfig[item.name]?.icon || '',
            end: item.name === 'dashboard',
            subItems: []
          };
        });

        rawData.forEach((item) => {
          const processedItem = itemMap[item.id];
          if (item.menu_head === null) {
            formattedStructure.push(processedItem);
          } else {
            if (itemMap[item.menu_head]) {
              itemMap[item.menu_head].subItems.push(processedItem);
            }
          }
        });

        // ✅ Filter: only show items the user has access to
        // Always show dashboard; filter the rest by allowedMenuNames
    const filterByPrivilege = (items) => {
          return items
            .filter(item => {
              if (isAdmin) return true;
              if (item.name === 'dashboard' ) return true;
              return allowedMenuNames.has(item.name);
            })
            .map(item => ({
              ...item,
              subItems: item.subItems ? filterByPrivilege(item.subItems) : []
            }));
        };

        const filtered = filterByPrivilege(formattedStructure);
        setNavItems(filtered);
      } catch (error) {
        console.error('Failed to fetch sidebar navigation:', error);
      }
    };

    // Only run once allowedMenuNames is ready
    if (!isLoading) fetchNavItems();
  }, [isLoading, allowedMenuNames]);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Glassmorphism Background */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 min-w-64 bg-[#2D1B4E]/90 backdrop-blur-xl text-white border-r border-white/10 flex flex-col h-full transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0`}
      >
        
        {/* Toggle Button */}
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

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-white">HR Core</h1>
          <p className="text-xs text-gray-400 mt-1">Management Portal</p>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1  overflow-y-auto hide-scrollbar">
          {isLoading ? (
            <div className="text-sm text-gray-400 text-center py-4">Loading menu...</div>
          ) : (
            navItems.map((item) => {
              const isDropdownOpen = openDropdownId === item.id;
              
              // Render Dropdown if subItems exist
              if (item.subItems && item.subItems.length > 0) {
                return (
                  <div key={item.id} className="w-full flex flex-col">
                    {/* Dropdown Trigger */}
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                        isDropdownOpen 
                          ? 'bg-white/5 text-white' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span className='font-bold tracking-tight'>{item.label}</span>
                      </div>
                      {/* Arrow Icon */}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Content */}
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isDropdownOpen ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-5 pl-4 border-l border-white/10 space-y-1 py-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.id}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)} 
                            className={({ isActive }) =>
                              `w-full flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                isActive
                                  ? 'bg-white/15 text-white shadow-sm'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Render Standard NavLink
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsOpen(false)} 
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className='font-bold tracking-tight'>{item.label}</span>
                </NavLink>
              );
            })
          )}
        </nav>

        {/* Footer */}
        {/* <div className="p-4 border-t border-white/10">
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
        </div> */}
      </aside>
    </>
  );
}