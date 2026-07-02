import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { axiosInstance } from '../config/axiosInstance';
import { usePrivileges } from '../context/PrivilegeContext';
import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  Network,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
} from 'lucide-react';

// Local dictionary to map backend "name" properties to their respective paths and icons
// Sorted alphabetically
const menuConfig = {
  attendance: {
    path: '/attendence',
    icon: CalendarCheck,
  },
  client_visits: {
    path: '/clientvisit',
    icon: BriefcaseBusiness,
  },
  create_details: {
    path: '/marketing',
    icon: Megaphone,
  },
  dashboard: {
    path: '/',
    icon: LayoutDashboard,
  },
  department: {
    path: '/department',
    icon: Building2,
  },
  designation: {
    path: '/designation',
    icon: Network,
  },
  employee_details: {
    path: '/employee',
    icon: Users,
  },
  leave_approval: {
    path: '/leaveapproval',
    icon: ClipboardCheck,
  },
  leaverequest: {
    path: '/leaverequest',
    icon: CalendarOff,
  },
  meetings: {
    path: '/meetings',
    icon: UsersRound,
  },
  my_task: {
    path: '/mytask',
    icon: ListTodo,
  },
  annual_attendance: {
    path: '/annual/attendence',
    icon: CalendarDays,
  },
  privileges: {
    path: '/settings/privilege/table',
    icon: ShieldCheck,
  },
  settings: {
    path: '#',
    icon: Settings,
  },
  task_management: {
    path: '/projects',
    icon: FolderKanban,
  },
  working_stage: {
    path: '/workingStage',
    icon: ClipboardList,
  },
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [navItems, setNavItems] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const { allowedMenuNames, isAdmin, isLoading } = usePrivileges();

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
            icon: menuConfig[item.name]?.icon || null, // Now stores the Lucide component
            end: item.name === 'dashboard',
            subItems: [],
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

        // Filter: only show items the user has access to
        const filterByPrivilege = (items) => {
          return items
            .filter((item) => {
              if (isAdmin) return true;
              if (item.name === 'dashboard') return true;
              return allowedMenuNames.has(item.name);
            })
            .map((item) => ({
              ...item,
              subItems: item.subItems ? filterByPrivilege(item.subItems) : [],
            }));
        };

        const filtered = filterByPrivilege(formattedStructure);
        setNavItems(filtered);
      } catch (error) {
        console.error('Failed to fetch sidebar navigation:', error);
      }
    };

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
          <ChevronRight
            className={`w-6 h-6 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-white">HR Core</h1>
          <p className="text-xs text-gray-400 mt-1">Management Portal</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto hide-scrollbar">
          {isLoading ? (
            <div className="text-sm text-gray-400 text-center py-4">Loading menu...</div>
          ) : (
            navItems.map((item) => {
              const isDropdownOpen = openDropdownId === item.id;
              const Icon = item.icon;

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
                        {Icon && <Icon className="w-5 h-5 opacity-80" />}
                        <span className="font-bold tracking-tight">{item.label}</span>
                      </div>
                      {/* Arrow Icon */}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
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
                  {Icon && <Icon className="w-5 h-5 opacity-80" />}
                  <span className="font-bold tracking-tight">{item.label}</span>
                </NavLink>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
}