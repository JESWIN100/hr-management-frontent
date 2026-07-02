import React, { useState, useEffect, useRef } from 'react';
import { Users, GripVertical, MessageCircleMore, X, Send, CheckCheck, MessageCircle } from 'lucide-react';
import { axiosInstance, IMAGE_BASE_URL } from '../../config/axiosInstance';

export default function EmployeeSidebar({ projectEmployeeData, handleDragStart, currentUserId, isChatHubOpen, toggleChatHub }) {
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  
  // Specific state for the user you are actively chatting with
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);
console.log(projectEmployeeData);

  // Fetch messages whenever a new user is selected
  useEffect(() => {
    if (chatUser) {
      fetchMessages();
    }
  }, [chatUser]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const receiverId = chatUser.employee_id || chatUser.id;
      const res = await axiosInstance.get(`/api/chat/user/${currentUserId}/${receiverId}`);
      
      setMessages(res.data.messages);
      setIsChatUserOnline(Boolean(res.data?.isOnline)); 

    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const receiverId = chatUser.employee_id || chatUser.id;
      const res = await axiosInstance.post('/api/chat/user', {
        sender_id: currentUserId,
        receiver_id: receiverId,
        message: messageInput
      });
      
      setMessages((prev) => [...prev, res.data]);
      setMessageInput('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col shrink-0 z-10">

       <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> Team Members
          </h2>
          
          <button
            onClick={toggleChatHub}
            className="bg-teal-600 w-9 h-9 flex items-center justify-center text-white rounded-full shadow-md hover:bg-teal-700 hover:scale-105 transition-all group shrink-0"
            title="Open Messages"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      
        <p className="text-xs text-slate-500 mb-4 pb-2 border-b border-slate-100">
          Drag members to tasks to assign them.
        </p>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {projectEmployeeData.map((emp) => (
            <div
              key={emp.employee_id || emp.id}
              draggable
              onDragStart={(e) => handleDragStart(e, emp)}
              className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-teal-400 transition group"
            >
              <GripVertical className="w-4 h-4 text-slate-400" />
              
             <div className="relative">
      <img
        src={`${IMAGE_BASE_URL}${emp?.image || emp?.avatar}`}
        alt={emp.employee_name}
        className="w-8 h-8 rounded-full border border-slate-300 object-cover"
      />
      {/* Moved the status dot INSIDE the relative div */}
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
          emp.isonline === true || String(emp.isonline) === 'true' || emp.isonline === 1
            ? 'bg-green-500' 
            : 'bg-red-500'
        }`}
      />
    </div>

              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-slate-700">
                  {emp.employee_name}
                </span>
                <span className="text-xs text-slate-500">
                  {emp?.position_name}
                </span>
              </div>
              
              <button 
                onClick={() => setChatUser(emp)}
                className="text-slate-400 hover:text-teal-600 transition-colors"
                title="Open Chat"
              >
                <MessageCircleMore className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Left-Sided Chat Modal / Drawer */}
      {chatUser && (
        <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 border-r border-slate-200 flex flex-col transition-transform transform translate-x-0">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={`${IMAGE_BASE_URL}${chatUser?.image || chatUser?.avatar}`}
                  alt={chatUser.employee_name}
                  className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white
                    ${isChatUserOnline ? 'bg-green-500' : 'bg-red-500'}`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{chatUser.employee_name}</h3>
                <p className={`text-xs ${isChatUserOnline ? 'text-teal-600' : 'text-slate-400'}`}>
                  {isChatUserOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setChatUser(null);
                setMessages([]); 
              }}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Body - WhatsApp Styling Applied Here */}
          <div 
            className="flex-1 p-4 overflow-y-auto flex flex-col gap-3"
            style={{ 
              backgroundColor: '#efeae2', 
              backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
              backgroundRepeat: 'repeat'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex justify-center mt-4">
                <p className="text-xs bg-yellow-100/80 text-yellow-800 px-3 py-1.5 rounded-lg shadow-sm text-center">
                  Start a conversation with {chatUser.employee_name}...
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* WhatsApp style message bubble */}
                    <div 
                      className={`relative max-w-[85%] rounded-lg px-2.5 py-1.5 text-[14px] shadow-sm flex flex-col 
                       ${isMe 
    ? 'bg-[#d9fdd3] rounded-tr-none' 
    : 'bg-white rounded-tl-none'    
  }`}
                    >
                      {/* pr-14 gives room for the absolute positioned time/ticks to not overlap text */}
                      <p className="pr-14 break-words leading-snug">{msg.message}</p>
                      
                      {/* Timestamp and Ticks container (Bottom Right corner) */}
                      <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5">
                        <span className="text-[10px] text-gray-500 pt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        
                          <CheckCheck
                            size={14}
                            className={`mt-1 ml-1 ${
                              Number(msg?.is_seen) === 1
                                ? "text-[#53bdeb]" // WhatsApp Blue Tick
                                : "text-gray-400"  // WhatsApp Gray Tick
                            }`}
                          />
                       
                      </div>

                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-[#f0f2f5] flex items-center gap-2">
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 p-2.5 px-4 text-sm bg-white border-none rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
            <button 
              type="submit" 
              disabled={!messageInput.trim()}
              className="p-2.5 bg-teal-600 text-white rounded-full shadow-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
      
      {/* Backdrop */}
      {chatUser && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          onClick={() => {
            setChatUser(null);
            setMessages([]);
          }}
        />
      )}
    </>
  );
}