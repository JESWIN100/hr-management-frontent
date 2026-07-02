import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../config/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  // --- State ---
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- Form Setup ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // --- Fetch Projects on Mount ---
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/api/task/projects'); 
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // --- Submit Handler ---
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/task/projects', data);
      
      // Add the new project to the UI immediately
      setProjects((prev) => [...prev, response.data]);
      
      // Close modal and reset form fields
      closeModal();
    } catch (error) {
      console.error("Error adding project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset(); // Clear the form when closed
  };

  // Helper function to safely format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen bg-[#f4f7fc] p-8 overflow-hidden font-sans antialiased text-slate-800">
      
      {/* Page Header with Add Button */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          + New Project
        </button>
      </div>

      {/* Background Grid Elements */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <p className="text-slate-500">No projects found. Create one!</p>
        ) : (
          projects.map((project) => (
            <div key={project.id}
              onClick={() => navigate('/tasks', { state: {projectname:project.name, projectId: project.id } })}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[220px] cursor-pointer hover:shadow-md transition-shadow">
              <div>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600">
                    Status: {project.status || 'planning'}
                  </span>
                  
                  {/* Displaying the real dates instead of fallback */}
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 font-medium">Start: {formatDate(project.start_date)}</span>
                    <span className="text-xs text-slate-400 font-medium">End: {formatDate(project.end_date)}</span>
                  </div>
                </div>
                
                {/* Card Body */}
                <h3 className="text-xl font-bold tracking-tight mb-2 text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{project.description}</p>
              </div>

              {/* Card Footer */}
              {/* <div className="flex justify-between items-center mt-6">
                <div className="flex -space-x-2">
                  <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=11" alt="user" />
                </div>
              </div> */}
            </div>
          ))
        )}
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-6 text-slate-900">Add New Project</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Project name is required' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Figma Component"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Briefly describe the project..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              {/* NEW Date Fields Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    {...register('start_date')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    {...register('end_date')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
               
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  {isLoading ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
}