import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// Import the components
import AuthPage from './auth/Login'; 
import RootLayout from './layout/RootLayout';
import DashboardContent from './pages/Dashboard'; // Moved here to be a child route
import './app.css';
import Employe from './pages/Employe';
import Department from './pages/Department';
import Desigination from './pages/Desigination';
import Register from './auth/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Marketing from './pages/Marketing';
import ClientVisitsList from './pages/ClientVisitsList';
import Attendence from './pages/Attendence';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-50 text-brand-600 font-sans">
        <Routes>
          {/* Base Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<Register />} />
          
          {/* Dashboard Layout & Nested Routes */}
          <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootLayout />}>
           
            <Route index element={<DashboardContent />} />
            
         
            <Route path="employee" element={<Employe />} />
            <Route path="department" element={<Department />} />
            <Route path="desigination" element={<Desigination />} />

            <Route path="marketing" element={<Marketing />} />
            <Route path="clientvisit" element={<ClientVisitsList />} />
            <Route path="attendence" element={<Attendence />} />
            </Route>
          </Route>

          {/* 404 Catch-All */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900">404</h2>
                  <p className="text-gray-500 mt-2 mb-6">The page you are looking for doesn't exist.</p>
                  
                  {/* Replaced standard <a> tag with React Router <Link> */}
                  <Link 
                    to="/login" 
                    className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}