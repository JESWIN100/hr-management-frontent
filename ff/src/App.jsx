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
import EmployeeAttendance from './pages/EmployeAttendence';
import LeaveRequestForm from './pages/LeaveRequestForm';
import LeaveApproval from './pages/LeaveApproval';
import PrivilegeManager from './pages/Previlage';
import PrivilegeTable from './pages/PrevilageTable';
import PrivateRoute from './context/PrivateRoute';
import TaskManagement from './pages/TaskManagment';
import Projects from './pages/Projects';
import EmployeeTaskBoard from './pages/EmployeeTaskBoard';
import MeetingPage from './pages/MeetingPage';
import WrokingStages from './pages/WrokingStages';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Dashboard from './pages/Dashboard';



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
           
            {/* <Route index element={<DashboardContent />} /> */}
            <Route index element={<EmployeeDashboard />} />
            
         <Route path="employee" element={
  <PrivateRoute menuName="employee_details"><Employe /></PrivateRoute>
} />
<Route path="department" element={
  <PrivateRoute menuName="department"><Department /></PrivateRoute>
} />
<Route path="designation" element={
  <PrivateRoute menuName="designation"><Desigination /></PrivateRoute>
} />
<Route path="marketing" element={
  <PrivateRoute menuName="create_details"><Marketing /></PrivateRoute>
} />
<Route path="attendence" element={
  <PrivateRoute menuName="attendance"><Attendence /></PrivateRoute>
} />
<Route path="leaveapproval" element={
  <PrivateRoute menuName="leave_approval"><LeaveApproval /></PrivateRoute>
} />
<Route path="leave_request" element={
  <PrivateRoute menuName="leave_request"><LeaveRequestForm /></PrivateRoute>
} />
<Route path="clientvisit" element={
  <PrivateRoute menuName="client_visits"><ClientVisitsList /></PrivateRoute>
} />
<Route path="projects" element={
  <PrivateRoute menuName="task_management"><Projects /></PrivateRoute>
} />
<Route path="workingStage" element={
  <PrivateRoute menuName="working_stage"><WrokingStages /></PrivateRoute>
} />

<Route path="/tasks" element={<TaskManagement />} />
<Route path="mytask" element={
  <PrivateRoute menuName="my_task"><EmployeeTaskBoard /></PrivateRoute>
} />
{/* <Route path="/mytask" element={<EmployeeTaskBoard />} /> */}
<Route path="meetings" element={
  <PrivateRoute menuName="meetings"><MeetingPage /></PrivateRoute>
} />
{/* <Route path="/meetings" element={<MeetingPage />} /> */}

          <Route path="annual/attendence" element={
  <PrivateRoute menuName="annual_attendance"><EmployeeAttendance /></PrivateRoute>
} />
            {/* <Route path="employee/attendence" element={<EmployeeAttendance />} /> */}
         
            <Route path="settings/privilege" element={<PrivilegeManager />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="settings/privilege/table" element={
              <PrivateRoute menuName="privileges"><PrivilegeTable/></PrivateRoute>
            } />
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