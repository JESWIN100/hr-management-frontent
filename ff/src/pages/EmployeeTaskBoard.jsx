import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Circle, Calendar, Clock, ListChecks, 
  AlertCircle, MessageCircle, Send, X, ChevronLeft, LayoutGrid 
} from 'lucide-react';
import { axiosInstance, IMAGE_BASE_URL } from './../config/axiosInstance';

export default function EmployeeTaskDashboard() {
  // TODO: Replace with actual logged-in user's ID
  const currentUserId = 1;

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');

  // --- Multi-Project Chat States ---
  const [isChatHubOpen, setIsChatHubOpen] = useState(false);
  const [activeChatProject, setActiveChatProject] = useState(null); // { id, name }
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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

  // Extract unique projects from the user's tasks
  const uniqueProjects = Array.from(new Set(tasks.map(t => t.project_id)))
    .map(id => {
      const task = tasks.find(t => t.project_id === id);
      return task ? { id: task.project_id, name: task.project_name } : null;
    })
    .filter(Boolean);

  // --- Chat Handlers ---
  const toggleChatHub = () => {
    setIsChatHubOpen(!isChatHubOpen);
    if (isChatHubOpen) setActiveChatProject(null); // Reset when closing
  };

  const openProjectChat = (project) => {
    setActiveChatProject(project);
  };

  const backToProjects = () => {
    setActiveChatProject(null);
    setChatMessages([]);
  };

  // Fetch messages when a specific project chat is opened
  useEffect(() => {
    if (activeChatProject?.id) {
      const fetchMessages = async () => {
        setIsChatLoading(true);
        try {
          const res = await axiosInstance.get(`/api/chat/${activeChatProject.id}`);
          setChatMessages(res.data);
        } catch (error) {
          console.error("Error fetching chat messages:", error);
        } finally {
          setIsChatLoading(false);
        }
      };
      fetchMessages();
    }
  }, [activeChatProject]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatProject]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !activeChatProject) return;
    
    try {
      const payload = {
        project_id: activeChatProject.id,
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- Task Handlers ---
  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await axiosInstance.put(`/api/task/tasks/${taskId}/status`, { 
        status: newStatus 
      }, { withCredentials: true });
    } catch (error) {
      console.error("Error updating task status", error);
      fetchMyTasks();
    }
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased relative">
      <div className="max-w-7xl mx-auto min-h-screen p-6">
        
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

                    <div className="flex-1 min-w-0">
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
                      
                      <p className={`text-sm mt-1 line-clamp-2 ${
                        task.status === 'Completed' ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {task.description || "No description provided."}
                      </p>

                      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-400">
                        {task.project_name && (
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                            {task.project_name}
                          </span>
                        )}
                        {task.end_date && (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {/* Quick Action to open chat for THIS project */}
                        {task.project_id && (
                          <button 
                            onClick={() => {
                              openProjectChat({ id: task.project_id, name: task.project_name });
                              setIsChatHubOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 transition ml-auto"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Chat
                          </button>
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

      {/* --- Multi-Project Chat Slide-In Panel --- */}
      {isChatHubOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/10 z-40 transition-opacity"
            onClick={toggleChatHub}
          ></div>
          <div className="fixed inset-y-0 right-0 w-[350px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Conditional Header based on View */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-800 text-white shrink-0">
              {activeChatProject ? (
                <div className="flex items-center gap-2">
                  <button onClick={backToProjects} className="p-1 hover:bg-slate-700 rounded transition">
                    <ChevronLeft className="w-5 h-5 text-teal-400" />
                  </button>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight truncate w-48">{activeChatProject.name}</h3>
                    <span className="text-[10px] text-slate-400">Project Chat</span>
                  </div>
                </div>
              ) : (
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-teal-400" /> 
                  Your Messages
                </h3>
              )}
              
              <button onClick={toggleChatHub} className="text-slate-400 hover:text-white transition p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* VIEW 1: Project Selection List */}
            {!activeChatProject ? (
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Projects</p>
                {uniqueProjects.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm mt-10">No active projects found.</div>
                ) : (
                  uniqueProjects.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => openProjectChat(proj)}
                      className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition text-left group"
                    >
                      <div className="bg-teal-50 p-2 rounded-lg group-hover:bg-teal-100 transition">
                        <LayoutGrid className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                        {proj.name}
                      </span>
                      <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180 group-hover:text-teal-500" />
                    </button>
                  ))
                )}
              </div>
            ) : (
              /* VIEW 2: Actual Chat Interface */
              <>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
                  {isChatLoading ? (
                    <div className="text-center text-slate-400 text-sm mt-10">Loading messages...</div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm mt-10">No messages yet. Say hi to the team!</div>
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
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={`Message ${activeChatProject.name}...`}
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
              </>
            )}
          </div>
        </>
      )}

      {/* --- Floating Action Button --- */}
      {!isChatHubOpen && (
        <button
          onClick={toggleChatHub}
          className="fixed bottom-6 right-6 bg-teal-600 text-white p-3.5 rounded-full shadow-lg hover:bg-teal-700 hover:scale-105 transition-all z-40 group"
          title="Open Messages"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}