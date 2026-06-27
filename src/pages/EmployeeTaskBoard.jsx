import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  ListChecks, 
  AlertCircle 
} from 'lucide-react';
import { axiosInstance } from './../config/axiosInstance';

export default function EmployeeTaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');

  // Fetch tasks assigned specifically to the logged-in employee
  const fetchMyTasks = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get('/api/task/task/myworks', {
        withCredentials: true,
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  // Mark a task as complete or revert to pending
  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    
    // Optimistic UI update for immediate feedback
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      // Update the status in the backend
      await axiosInstance.put(`/api/task/tasks/${taskId}/status`, { 
        status: newStatus 
      }, { withCredentials: true });
    } catch (error) {
      console.error("Error updating task status", error);
      // If it fails, revert the optimistic update
      fetchMyTasks();
    }
  };

  // Filter tasks based on the active tab
  const filteredTasks = tasks.filter(task => 
    activeTab === 'Pending' 
      ? task.status !== 'Completed' 
      : task.status === 'Completed'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <Clock className="w-5 h-5 animate-spin mr-2" />
        Loading your tasks...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <div className="max-w-7xl mx-auto min-h-screen">
        
        {/* Main Content Card with Folder-Style Tabs Inside */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex bg-slate-100 border-b border-slate-200 pt-3 px-3 gap-1">
            <button
              onClick={() => setActiveTab('Pending')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-t border-l border-r transition-colors ${
                activeTab === 'Pending'
                  ? 'bg-white border-slate-200 text-teal-600'
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              Pending Tasks
            </button>
            <button
              onClick={() => setActiveTab('Completed')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-t border-l border-r transition-colors ${
                activeTab === 'Completed'
                  ? 'bg-white border-slate-200 text-teal-600'
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Folder Content / Task List */}
          <div className="p-6 bg-white min-h-[400px]">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <ListChecks className="w-12 h-12 mb-3 opacity-50" />
                <p>No {activeTab.toLowerCase()} tasks found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      task.status === 'Completed' 
                        ? 'bg-slate-50 border-slate-200 opacity-75' 
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Main Task Status Toggle Button */}
                    <button 
                      onClick={() => toggleTaskStatus(task.id, task.status || 'Pending')}
                      className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full"
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-teal-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-teal-400 transition-colors" />
                      )}
                    </button>

                    {/* Task Details & Subtasks */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Title & Priority Header */}
                      <div className="flex justify-between items-start gap-4">
                        <h3 className={`text-base font-semibold truncate ${
                          task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}>
                          {task.title}
                        </h3>
                        {task.priority === 'High' && task.status !== 'Completed' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full shrink-0">
                            <AlertCircle className="w-3 h-3" /> Urgent
                          </span>
                        )}
                      </div>
                      
                      {/* Task Description */}
                      <p className={`text-sm mt-1 line-clamp-2 ${
                        task.status === 'Completed' ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {task.description || "No description provided."}
                      </p>

                      {/* Subtasks Section */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Subtasks ({task.subtasks.length})
                          </h4>
                          <div className="flex flex-col gap-2.5">
                            {task.subtasks.map((sub) => (
                              <div key={sub.id} className="flex items-start gap-2.5 text-sm">
                                {/* Visual indicator for subtask status */}
                                {sub.status === 'Completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                                )}
                                <span className={`leading-tight ${
                                  sub.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-600'
                                }`}>
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Task Metadata (Project & Date) */}
                      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-400">
                        {task.project_name && (
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {task.project_name}
                          </span>
                        )}
                        {task.end_date && (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}