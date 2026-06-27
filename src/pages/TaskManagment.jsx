import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Paperclip, MessageSquare, Calendar, 
  Plus, MoreHorizontal, Filter, Users, X, GripVertical, UserPlus, Search,ListChecks, CheckCircle2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { axiosInstance, IMAGE_BASE_URL } from './../config/axiosInstance';

export default function TaskManagement() {
  const location = useLocation();
  const projectId = location.state?.projectId; 
  const projectname = location.state?.projectname; 
  
  const [boardData, setBoardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStageId, setActiveStageId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [projectEmployeeData, setProjectEmployeeData] = useState([]);
  const [taskEmployeeData, setTaskEmployeeData] = useState([]);
  
  // --- States for Side Panel ---
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Member');
  

// --- States for Subtasks ---
const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
const [activeParentTask, setActiveParentTask] = useState(null);
const [subtasks, setSubtasks] = useState([]);
const [newSubtask, setNewSubtask] = useState({ title: '', assigned_to: '' });

  // --- State for Task Creation (Arrays for multiple assignments) ---
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    assigned_to: [], 
    assigned_to_name: [], 
    start_date: '', 
    end_date: ''
  });

  const fetchemploye = async () => {
    try {
      const res = await axiosInstance.get('/api/employees', {
        withCredentials: true,
      });
      setEmployeeData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  const fetchprojectemploye = async () => {
    try {
      const res = await axiosInstance.get(`/api/task/projects/get/employee/${projectId}`, {
        withCredentials: true,
      });
      setProjectEmployeeData(res.data);
    } catch (error) {
      console.error('Failed to fetch project employees', error);
    }
  };

const fetchTaskEmployees = async (taskId) => {
  try {
    const res = await axiosInstance.get(`/api/task/task/employees/${taskId}`, {
      withCredentials: true,
    });
    console.log("res",res);
    
    setTaskEmployeeData(res.data);
  } catch (error) {
    console.error('Failed to fetch task employees', error);
  }
};

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setIsLoading(true);
        const tasksEndpoint = `/api/task/tasks/id/?project_id=${projectId}`;

        const [stagesRes, tasksRes] = await Promise.all([
          axiosInstance('/api/task/working-stages'),
          axiosInstance(tasksEndpoint) 
        ]);
        
        const stages = stagesRes.data;
        const tasks = tasksRes.data;

        const constructedBoard = stages.map((stage) => {
          const stageTasks = tasks.filter(t => t.working_stage_id === stage.id);
          return {
            id: stage.id,
            title: stage.name,
            tasks: stageTasks.map(t => ({
              id: t.id,
              title: t.title,
              description: t.description,
              dueDate: t.end_date ? new Date(t.end_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit'}) : null,
              avatars: t.images ? t.images.split(',') : [],
              label: { text: t.status || 'New', color: 'bg-blue-100 text-blue-800' }
            }))
          };
        });

        setBoardData(constructedBoard);
      } catch (error) {
        console.error('Error fetching board data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
    fetchemploye();
    fetchprojectemploye();
  
  }, [projectId]); 

  // --- Task Modal Handlers ---
  const openModal = (stageId) => {
    setActiveStageId(stageId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveStageId(null);
    setFormData({ title: '', description: '', assigned_to: [], assigned_to_name: [], start_date: '', end_date: '' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Employee Side Panel Handlers ---
  const closeEmpModal = () => {
    setIsEmpModalOpen(false);
    setSelectedEmpIds([]);
    setEmpSearch('');
    setSelectedRole('Member');
  };

  const toggleEmployeeSelection = (id) => {
    setSelectedEmpIds((prev) => 
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const handleAddEmployeeToProject = async (e) => {
    e.preventDefault();
    if (selectedEmpIds.length === 0) return;

    try {
      const response = await axiosInstance.post('/api/task/projects/add/employee', {
        project_id: projectId,
        employee_ids: selectedEmpIds,
        role: selectedRole
      });
      console.log('Employees added to project:', response.data);
      closeEmpModal();
      fetchprojectemploye();
    } catch (error) {
      console.error('Error adding employees to project:', error);
      alert(error.response?.data?.message || 'Failed to add employees');
    }
  };

  const filteredEmployees = employeeData.filter(emp => 
    emp.name.toLowerCase().includes(empSearch.toLowerCase())
  );

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const { assigned_to_name, ...submitData } = formData;
    const payload = { project_id: projectId, working_stage_id: activeStageId, ...submitData };

    try {
      const response = await axiosInstance.post('/api/task/tasks', payload);
      if (response.data.id) { 
        const newTaskFromDb = response.data; 
        
        setBoardData(prev => prev.map((col) => {
          if (col.id === activeStageId) {
            return {
              ...col,
              tasks: [...col.tasks, {
                id: newTaskFromDb.id,
                title: newTaskFromDb.title,
                dueDate: formData.end_date ? new Date(formData.end_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit'}) : '',
                label: { text: newTaskFromDb.status, color: 'bg-green-100 text-green-800' },
                avatars: [] 
              }]
            };
          }
          return col;
        }));
        closeModal();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDragStart = (e, employee) => {
    e.dataTransfer.setData('employee', JSON.stringify(employee));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, columnId, taskId) => {
    e.preventDefault();
    const employeeData = e.dataTransfer.getData('employee');
    
    if (employeeData) {
      const employee = JSON.parse(employeeData);
      const empId = employee.employee_id || employee.id;
      try {
        const response = await axiosInstance.put(`/api/task/update/employeee/${taskId}`, { assigned_to: empId });
        
        if (response.data.ok) {
          setBoardData(prevBoard => prevBoard.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: col.tasks.map(task => {
                  if (task.id === taskId) {
                    const currentAvatars = task.avatars || [];
                    const newAvatar = employee.image || employee.avatar;
                    if (!currentAvatars.includes(newAvatar)) {
                      return { ...task, avatars: [...currentAvatars, newAvatar] };
                    }
                  }
                  return task;
                })
              };
            }
            return col;
          }));
        }
      } catch (error) {
        console.error('Error assigning user:', error);
      }
    }
  };

const handleModalDrop = (e) => {
  e.preventDefault();
  const employeeData = e.dataTransfer.getData('employee');
  
  if (employeeData) {
    const employee = JSON.parse(employeeData);
    
    // Safely check for either ID structure
    const empId = employee.employee_id || employee.id;
    const empName = employee.employee_name || employee.name;

    if (!empId) {
       console.error("Employee ID is missing:", employee);
       return;
    }

    setFormData(prev => {
      if (prev.assigned_to.includes(empId)) return prev;
      
      return { 
        ...prev, 
        assigned_to: [...prev.assigned_to, empId], 
        assigned_to_name: [...prev.assigned_to_name, empName] 
      };
    }); 
  }
};

  const removeAssignee = (index) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.filter((_, i) => i !== index),
      assigned_to_name: prev.assigned_to_name.filter((_, i) => i !== index)
    }));
  };



const openSubtaskModal = async (task) => {
    setActiveParentTask(task);
    setIsSubtaskModalOpen(true);
    fetchTaskEmployees(task.id);
    try {
        // Replace with your actual route path
        const res = await axiosInstance.get(`/api/task/subtasks/${task.id}`);
        setSubtasks(res.data);
    } catch (error) {
        console.error("Error fetching subtasks", error);
    }
};

const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.title.trim()) return;
    
    try {
        const payload = {
            task_id: activeParentTask.id,
            title: newSubtask.title,
            assigned_to: newSubtask.assigned_to || null
        };
        const res = await axiosInstance.post('/api/task/subtasks', payload);
        
        // Optimistically update UI
        setSubtasks([...subtasks, { ...res.data, status: 'Pending' }]);
        setNewSubtask({ title: '', assigned_to: '' }); 
    } catch (error) {
        console.error("Error creating subtask", error);
    }
};

const toggleSubtask = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    
    // Optimistic update
    setSubtasks(prev => prev.map(st => st.id === subtaskId ? { ...st, status: newStatus } : st));
    
    try {
        await axiosInstance.put(`/api/task/subtasks/status/${subtaskId}`, { status: newStatus });
    } catch (error) {
        console.error("Error updating subtask status", error);
    }
};

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading board...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased relative overflow-hidden">
      {/* Sub-Header */}
      <section className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-white font-bold text-xs">⚡</div>
          <h1 className="text-base font-semibold text-slate-900 flex items-center gap-2">{projectname}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEmpModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </section>

      {/* Main Workspace Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Employee Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col shrink-0 z-10">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> Team Members
          </h2>
          <p className="text-xs text-slate-500 mb-4 pb-2 border-b border-slate-100">
            Drag members to tasks to assign them.
          </p>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {projectEmployeeData.map((emp) => (
              <div
               key={emp.employee_id || emp.id}
                draggable
                onDragStart={(e) => handleDragStart(e, emp)}
                className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-teal-400 transition"
              >
                <GripVertical className="w-4 h-4 text-slate-400" />

                <img
                  src={`${IMAGE_BASE_URL}${emp?.image || emp?.avatar}`}
                  alt={emp.employee_name}
                  className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                />

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">
                    {emp.employee_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {emp?.position}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Kanban Board Container */}
        <main className="flex-1 overflow-x-auto p-6 flex gap-5 items-start raw-scrollbar relative">
          {boardData.map((column) => (
            <div key={column.id} className="w-72 shrink-0 flex flex-col max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-slate-800 text-sm tracking-wide">{column.title}</h2>
                <button className="p-1 hover:bg-slate-200 rounded text-slate-500 transition">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => openModal(column.id)}
                className="w-full bg-white border border-dashed border-slate-300 hover:border-teal-500 hover:bg-slate-50 text-slate-500 hover:text-teal-600 text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-2 transition mb-3 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>

              <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-4">
                {column.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id, task.id)}
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
                        {/* Add this inside the task card footer, next to the calendar/due date */}
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
                ))}
              </div>
            </div>
          ))}

          {/* Create Task Modal */}
          {isModalOpen && (
            <div className="absolute inset-0 bg-slate-900/50 flex justify-center z-50 rounded-tl-lg">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-xl h-fit mt-10">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <h3 className="font-semibold text-slate-800">Create New Task</h3>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateTask} className="p-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Task Title *</label>
                    <input 
                      required
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  
                  {/* Droppable Area for Multiple Assignees */}
                  <div onDragOver={handleDragOver} onDrop={handleModalDrop}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Assignees</label>
                    <div className="w-full px-3 py-2 border border-slate-300 border-dashed hover:border-teal-400 rounded-md text-sm min-h-[42px] flex flex-wrap gap-2 items-center bg-slate-50 transition">
                      {formData.assigned_to_name.length > 0 ? (
                        formData.assigned_to_name.map((name, idx) => (
                          <span key={idx} className="bg-teal-100 text-teal-800 px-2 py-1 rounded flex items-center gap-1 text-xs font-medium">
                            {name}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-teal-900" 
                              onClick={() => removeAssignee(idx)} 
                            />
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">Drag team members here...</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                      <input 
                        type="date" 
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                      <input 
                        type="date" 
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition shadow-sm">Create Task</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Right Slide-In Panel for Adding Employees */}
      {isEmpModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity"
            onClick={closeEmpModal}
          ></div>

          <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Add to Project</h3>
                <p className="text-xs text-slate-500 mt-1">Select multiple members to add.</p>
              </div>
              <button onClick={closeEmpModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-md hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Assign Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Member">Team Member</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center text-slate-500 text-sm mt-10">No employees found.</div>
              ) : (
                filteredEmployees.map(emp => (
                  <label 
                    key={emp.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      selectedEmpIds.includes(emp.id) 
                        ? 'border-teal-500 bg-teal-50/50' 
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={selectedEmpIds.includes(emp.id)}
                      onChange={() => toggleEmployeeSelection(emp.id)}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <img 
                      src={`${IMAGE_BASE_URL}${emp?.avatar}`} 
                      alt={emp.name} 
                      className="w-9 h-9 rounded-full object-cover border border-slate-300 bg-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800">{emp.name}</span>
                      <span className="text-[11px] text-slate-500">ID: {emp.id}</span>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-sm font-medium text-slate-600">
                {selectedEmpIds.length} selected
              </span>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={closeEmpModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEmployeeToProject}
                  disabled={selectedEmpIds.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition shadow-sm"
                >
                  Confirm Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}


      {/* --- Subtask Modal --- */}
{isSubtaskModalOpen && (
  <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-600" /> 
            Manage Subtasks
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Parent: {activeParentTask?.title}</p>
        </div>
        <button onClick={() => setIsSubtaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Subtask List */}
      <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
        {subtasks.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-4">No subtasks yet. Create one below.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {subtasks.map((st) => (
              <div key={st.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleSubtask(st.id, st.status)}>
                    <CheckCircle2 className={`w-5 h-5 transition ${st.status === 'Completed' ? 'text-teal-500' : 'text-slate-300 hover:text-teal-400'}`} />
                  </button>
                  <span className={`text-sm font-medium ${st.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {st.title}
                  </span>
                </div>
                
                {/* Show Assignee if exists */}
                {st.assigned_to && (
                  <div className="flex items-center gap-1.5" title={st.employee_name}>
                    <img 
                      src={st.avatar ? `${IMAGE_BASE_URL}${st.avatar}` : '/default-avatar.png'} 
                      alt="avatar" 
                      className="w-6 h-6 rounded-full border border-slate-200 object-cover" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Subtask Form */}
      <form onSubmit={handleCreateSubtask} className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="e.g. Create hero section..." 
            value={newSubtask.title}
            onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            required
          />
          <div className="flex items-center gap-2">
            <select
              value={newSubtask.assigned_to}
              onChange={(e) => setNewSubtask({ ...newSubtask, assigned_to: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="">Assign to...</option>
              {taskEmployeeData.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_name}
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md transition shadow-sm whitespace-nowrap"
            >
              Add Subtask
            </button>
          </div>
        </div>
      </form>
      
    </div>
  </div>
)}
    </div>
  );
}