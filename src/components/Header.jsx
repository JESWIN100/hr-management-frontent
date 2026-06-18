import React, { useState } from 'react';
import { 
  Search, Menu, Sun, Mail, Bell, Calendar, ChevronDown, 
  User, ClipboardList, HelpCircle, Settings, DollarSign, LogOut 
} from 'lucide-react';

export default function Header() {
  // State to handle the dropdown menu toggle
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 relative z-50">
      
      {/* --- Left Section: Menu & Search --- */}
      <div className="flex items-center gap-6">
        {/* <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <Menu className="w-5 h-5" />
        </button> */}

        <div className="relative w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search anything's" 
            className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* --- Right Section: Actions & Profile --- */}
      <div className="flex items-center gap-5">
        
        {/* Theme Toggle */}
        {/* <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Sun className="w-5 h-5" />
        </button> */}

        {/* Divider */}
        {/* <div className="h-6 w-px bg-gray-200"></div> */}

        {/* Icon Group */}
        {/* <div className="flex items-center gap-4">
          <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
            <Mail className="w-5 h-5" />
        
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
        </div> */}

        {/* User Profile & Dropdown */}
        <div className="relative ml-2">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors focus:outline-none"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800 leading-tight">Robert Brown</span>
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <span>Manager</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://i.pravatar.cc/150?img=32" // Placeholder matching the woman's avatar style
                alt="Robert Brown" 
                className="w-9 h-9 rounded-full object-cover"
              />
              {/* Green Online Dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
              
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                <img 
                  src="https://i.pravatar.cc/150?img=32" 
                  alt="Robert Brown" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-800">Robert Brown</div>
                  <div className="text-xs text-gray-400">robert@gmail.com</div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-2">
                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" /> View Profile
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3">
                  <ClipboardList className="w-4 h-4 text-gray-400" /> My Task
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-gray-400" /> Help Center
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3">
                  <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Upgrade Plan
                </button>
              </div>

              {/* Logout Action */}
              <div className="border-t border-gray-50 pt-2 mt-1 px-2">
                <button className="w-full px-2 py-2 text-left text-sm text-orange-500 hover:bg-orange-50 rounded-lg flex items-center gap-3 font-medium transition-colors">
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </header>
  );
}