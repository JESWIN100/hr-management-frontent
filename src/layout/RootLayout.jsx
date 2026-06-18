import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../app.css';

export default function RootLayout() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="flex h-screen bg-brand-50 font-sans overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />


      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header />

        {/* Dynamic Content based on Sidebar Nav */}
        {/* Make sure we allow vertical scroll here, but hide horizontal so the table handles it */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden ">
          <Outlet />
        </div>
      </main>
    </div>
  );
}