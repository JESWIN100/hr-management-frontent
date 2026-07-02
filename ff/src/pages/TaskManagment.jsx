import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, Paperclip, MessageSquare, Calendar, 
  Plus, MoreHorizontal, Filter, Users, X, GripVertical, UserPlus, Search, ListChecks, CheckCircle2, MessageCircle, Send
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { axiosInstance, IMAGE_BASE_URL } from './../config/axiosInstance';
import SubHeader from '../components/taskmanagment.jsx/SubHeader';
import EmployeeSidebar from '../components/taskmanagment.jsx/EmployeeSidebar';
import TaskCard from '../components/taskmanagment.jsx/TaskCard';

export default function TaskManagement() {
  const location = useLocation();
  const projectId = location.state?.projectId; 
  const projectname = location.state?.projectname; 
  
  // TODO: Replace this with your actual logged-in user's ID from Context/Redux
  const currentUserId =  sessionStorage.getItem("EMPLOYEE_ID"); 
  
  const [boardData, setBoardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStageId, setActiveStageId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [projectEmployeeData, setProjectEmployeeData] = useState([]);
  const [taskEmployeeData, setTaskEmployeeData] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // --- States for Side Panel ---
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // --- States for Subtasks ---
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [activeParentTask, setActiveParentTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({ title: '', assigned_to: '' });

  // --- States for Chat ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [isChatHubOpen, setIsChatHubOpen] = useState(false);
  const toggleChatHub = () => setIsChatHubOpen(!isChatHubOpen);

  // --- State for Task Creation ---
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

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get('/api/task/roles', {
        withCredentials: true,
      });
      setRoles(res.data.data || res.data); 
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  const fetchTaskEmployees = async (taskId) => {
    try {
      const res = await axiosInstance.get(`/api/task/task/employees/${taskId}`, {
        withCredentials: true,
      });
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
    fetchRoles();
  }, [projectId]); 

  // --- Chat Handlers & Effects ---
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Fetch chat messages when the panel opens
  useEffect(() => {
    if (isChatOpen && projectId) {
      const fetchMessages = async () => {
        setIsChatLoading(true);
        try {
          const res = await axiosInstance.get(`/api/chat/${projectId}`);
          setChatMessages(res.data);
        } catch (error) {
          console.error("Error fetching chat messages:", error);
        } finally {
          setIsChatLoading(false);
        }
      };
      fetchMessages();
    }
  }, [isChatOpen, projectId]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    
    try {
      const payload = {
        project_id: projectId,
        sender_id: currentUserId,
        message: currentMessage
      };

      const res = await axiosInstance.post('/api/chat', payload);
      setChatMessages(prev => [...prev, res.data]);
      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
    setSelectedRole('');
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
      await axiosInstance.post('/api/task/projects/add/employee', {
        project_id: projectId,
        employee_ids: selectedEmpIds,
        role: selectedRole
      });
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

  // --- Subtask Handlers ---
  const openSubtaskModal = async (task) => {
    setActiveParentTask(task);
    setIsSubtaskModalOpen(true);
    fetchTaskEmployees(task.id);
    try {
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
      
      setSubtasks([...subtasks, { ...res.data, status: 'Pending' }]);
      setNewSubtask({ title: '', assigned_to: '' }); 
    } catch (error) {
      console.error("Error creating subtask", error);
    }
  };

  const toggleSubtask = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    setSubtasks(prev => prev.map(st => st.id === subtaskId ? { ...st, status: newStatus } : st));
    try {
      await axiosInstance.put(`/api/task/subtasks/status/${subtaskId}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating subtask status", error);
    }
  };

  const handleReassignSubtask = async (subtaskId, newAssigneeId) => {
    try {
      const selectedEmp = taskEmployeeData.find(emp => String(emp.employee_id) === String(newAssigneeId));

      setSubtasks(prev => prev.map(st => {
        if (st.id === subtaskId) {
          return { 
            ...st, 
            assigned_to: newAssigneeId || null,
            employee_name: selectedEmp ? selectedEmp.employee_name : null,
            avatar: selectedEmp ? selectedEmp.image : null
          };
        }
        return st;
      }));

      await axiosInstance.put(`/api/task/subtasks/assignee/${subtaskId}`, { 
        assigned_to: newAssigneeId || null 
      });
    } catch (error) {
      console.error("Error updating subtask assignee", error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading board...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased relative overflow-hidden">
      {/* Sub-Header */}
      <SubHeader 
        projectname={projectname} 
        onAddEmployeeClick={() => setIsEmpModalOpen(true)} 
      />

      {/* Main Workspace Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Employee Sidebar */}
        <EmployeeSidebar 
          projectEmployeeData={projectEmployeeData} 
          handleDragStart={handleDragStart} 
          currentUserId={currentUserId}
        toggleChatHub={toggleChat}
          
        />

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
                 <TaskCard 
                    key={task.id}
                    task={task}
                    columnId={column.id}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    openSubtaskModal={openSubtaskModal}
                  />
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
                  <option value="" disabled>Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id || role._id} value={role.id}>
                      {role.status_name || role.label} 
                    </option>
                  ))}
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
                      
                      {/* Reassignment Block */}
                      <div className="flex items-center gap-2">
                        <select
                          value={st.assigned_to || ""}
                          onChange={(e) => handleReassignSubtask(st.id, e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-600 focus:outline-none focus:border-teal-500 cursor-pointer"
                        >
                          <option value="">Unassigned</option>
                          {taskEmployeeData.map((emp) => (
                            <option key={emp.employee_id} value={emp.employee_id}>
                              {emp.employee_name}
                            </option>
                          ))}
                        </select>

                        {/* Show Assignee Avatar if exists */}
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

      {/* --- Chat Slide-In Panel --- */}
      {isChatOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/10 z-40 transition-opacity"
            onClick={toggleChat}
          ></div>
          <div className="fixed inset-y-0 left-0 w-[350px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-800 text-white shrink-0">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-teal-400" /> 
                Project Chat
              </h3>
              <button onClick={toggleChat} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
              {isChatLoading ? (
                <div className="text-center text-slate-400 text-sm mt-10">Loading messages...</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-10">No messages yet. Say hi!</div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      {!isMe && (
                        <span className="text-[11px] text-slate-500 mb-1 ml-1">{msg.sender_name}</span>
                      )}
                      <div className="flex items-end gap-2">
                        {!isMe && (
                          <img 
                            src={msg.avatar ? `${IMAGE_BASE_URL}${msg.avatar}` : '/default-avatar.png'} 
                            alt={msg.sender_name}
                            className="w-6 h-6 rounded-full border border-slate-200 object-cover mb-1"
                          />
                        )}
                        <div className={`px-3 py-2 shadow-sm ${
                          isMe 
                            ? 'bg-teal-600 text-white rounded-2xl rounded-br-sm' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <span className={`text-[10px] mt-1 block text-right ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
                            {formatTime(msg.created_at || new Date())}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Invisible element to auto-scroll to */}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50"
              />
              <button 
                type="submit" 
                disabled={!currentMessage.trim()}
                className="p-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </>
      )}

    
    </div>
  );
}