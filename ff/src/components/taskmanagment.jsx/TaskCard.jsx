



import React from 'react';
import { Calendar, ListChecks } from 'lucide-react';
import { IMAGE_BASE_URL } from '../../config/axiosInstance';

export default function TaskCard({ task, columnId, handleDragOver, handleDrop, openSubtaskModal }) {
  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, columnId, task.id)}
      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-teal-400 transition duration-200 group relative flex flex-col cursor-pointer"
    >
      {task.label && (
        <span className={`inline-block self-start text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2.5 ${task.label.color}`}>
          {task.label.text}
        </span>
      )}

      <div className="flex items-start gap-2.5 mb-2">
        <input type="checkbox" className="mt-1 rounded-full border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer" />
        <h3 className="text-sm font-medium text-slate-800 leading-snug group-hover:text-teal-600 transition">
          {task.title}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); openSubtaskModal(task); }}
            className="flex items-center gap-1 text-slate-500 hover:text-teal-600 transition ml-2 bg-slate-50 px-1.5 py-0.5 rounded text-[11px]"
          >
            <ListChecks className="w-3.5 h-3.5" />
            Subtasks
          </button>
        </div>
        
        <div className="flex items-center -space-x-1.5 ml-auto">
          {task.avatars?.map((src, idx) => (
            src && (
              <img 
                key={idx} 
                className="w-5 h-5 rounded-full border-2 border-white object-cover shadow-sm bg-white" 
                src={`${IMAGE_BASE_URL}${src}`}
                alt="avatar" 
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
}