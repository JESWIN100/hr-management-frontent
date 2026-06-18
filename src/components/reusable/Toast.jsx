import React, { useEffect } from 'react';

const Toast = ({ 
  isOpen, 
  onClose, 
  title = "Bootstrap", 
  timeAgo = "11 mins ago", 
  message = "Hello, world! This is a toast message.",
  duration = 6000 // 6 seconds in milliseconds
}) => {
  
  // Handle auto-dismissal after the specified duration
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      // Cleanup the timer if the component unmounts or isOpen changes
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    // Fixed position on the top-right
    <div 
      className="fixed bottom-5 right-5 z-50 w-80 bg-white rounded shadow-sm border border-gray-200 animate-fade-in-down" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white rounded-t">
        <div className="flex items-center gap-2">
          {/* Logo placeholder - roughly matching the geometric colors in your image */}
          <div className="w-4 h-4 grid grid-cols-2 grid-rows-2 rounded overflow-hidden">
            <div className="bg-green-500"></div>
            <div className="bg-blue-500"></div>
            <div className="bg-yellow-400"></div>
            <div className="bg-white"></div>
          </div>
          <strong className="text-sm font-bold text-slate-800">{title}</strong>
        </div>
        
        <div className="flex items-center gap-3">
          <small className="text-xs text-slate-500">{timeAgo}</small>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-0.5 rounded"
            aria-label="Close"
          >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-3 text-sm font-medium text-slate-400">
        {message}
      </div>
    </div>
  );
};

export default Toast;