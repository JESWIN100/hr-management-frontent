import React from 'react';
import { UserPlus } from 'lucide-react';
import SubtleButton from '../../components/reusable/SubtleButton';
export default function SubHeader({ projectname, onAddEmployeeClick }) {
  return (
    <section className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-white font-bold text-xs">⚡</div>
        <h1 className="text-base font-semibold text-slate-900 flex items-center gap-2">{projectname}</h1>
      </div>
      
      <div className="flex items-center gap-3">

        <SubtleButton variant="custom" className="flex items-center gap-2" onClick={onAddEmployeeClick}> <UserPlus className="w-4 h-4" />Add Employee</SubtleButton>
        {/* <button 
          onClick={onAddEmployeeClick}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
        >
          
          Add Employee
        </button> */}
      </div>
    </section>
  );
}