import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, Search, MessageSquare, User, ArrowLeft } from 'lucide-react';
import { axiosInstance, IMAGE_BASE_URL } from '../config/axiosInstance';

export default function EmployeeChatPage({  contactsData = [] }) {
  const currentUserId=sessionStorage.getItem("EMPLOYEE_ID"); 
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Fetch messages whenever a new contact is selected
  useEffect(() => {
    if (activeContact) {
      fetchMessages();
    }
  }, [activeContact]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const receiverId = activeContact.employee_id || activeContact.id;
      const res = await axiosInstance.get(`/api/chat/user/${currentUserId}/${receiverId}`);
      
      setMessages(res.data.messages || []);
      setIsChatUserOnline(Boolean(res.data?.isOnline)); 
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const receiverId = activeContact.employee_id || activeContact.id;
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

  // Filter contacts based on search
  const filteredContacts = contactsData.filter(contact => 
    contact.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm m-4">
      
      {/* Left Sidebar: Contacts List */}
      <div className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" /> Messages
          </h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <button
                key={contact.employee_id || contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-teal-50 transition-colors text-left ${
                  activeContact && (activeContact.employee_id || activeContact.id) === (contact.employee_id || contact.id) 
                    ? 'bg-teal-50 border-l-4 border-l-teal-600' 
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  {contact?.image || contact?.avatar ? (
                    <img
                      src={`${IMAGE_BASE_URL}${contact?.image || contact?.avatar}`}
                      alt={contact.employee_name}
                      className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  {/* Status indicator can go here if contact list includes online status */}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{contact.employee_name}</h4>
                  <p className="text-xs text-slate-500 truncate">{contact?.position_name || 'Team Member'}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-slate-400 text-sm mt-8">No contacts found.</p>
          )}
        </div>
      </div>

      {/* Right Area: Active Chat Window */}
      <div className={`flex-1 flex flex-col bg-white ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white shadow-sm z-10">
              <button 
                className="md:hidden p-2 text-slate-400 hover:text-slate-600"
                onClick={() => setActiveContact(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="relative">
                {activeContact?.image || activeContact?.avatar ? (
                  <img
                    src={`${IMAGE_BASE_URL}${activeContact?.image || activeContact?.avatar}`}
                    alt={activeContact.employee_name}
                    className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                    ${isChatUserOnline ? 'bg-green-500' : 'bg-slate-400'}`}
                />
              </div>
              
              <div>
                <h3 className="text-base font-semibold text-slate-800">{activeContact.employee_name}</h3>
                <p className={`text-xs font-medium ${isChatUserOnline ? 'text-teal-600' : 'text-slate-500'}`}>
                  {isChatUserOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    Start a conversation with {activeContact.employee_name}...
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] md:max-w-[60%] rounded-xl p-3 text-sm shadow-sm ${
                        isMe 
                          ? 'bg-teal-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                          <span className="text-[10px]">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <CheckCheck
                              size={14}
                              // Keeping your specific read-receipt logic
                              className={Number(msg?.is_seen) === 0 ? "text-blue-400" : "text-teal-200"}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-end gap-2">
              <textarea 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..." 
                className="flex-1 max-h-32 min-h-[44px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none"
                rows="1"
              />
              <button 
                type="submit" 
                disabled={!messageInput.trim()}
                className="h-[44px] px-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium text-slate-500">Your Messages</p>
            <p className="text-sm mt-1">Select a contact from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}