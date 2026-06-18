import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../config/axiosInstance';
import Toast from '../components/reusable/Toast';

// Ensure this path matches where you saved the new Toast component


const AuthPage = () => {
  const navigate = useNavigate();

  // Updated state names to reflect the Toast component
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      }, {
        withCredentials: true
      });
      
      console.log(res);
      if (res.data.success === true) {
        sessionStorage.setItem("TOKEN", res.data.token); 
        navigate('/');
      }
      
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.response?.data);
      
      const message = error.response?.data?.message || 
                      error.response?.data || 
                      "An unexpected error occurred. Please try again.";
      
      setErrorMessage(message);
      setShowToast(true); // Trigger the toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Main Folder-Style Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Form Content Area */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-gray-500 mt-2">
                Enter your credentials to access your account.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email is required" })}
                  className={`w-full px-4 py-3 rounded-lg border outline-none transition-all focus:ring-2 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className={`w-full px-4 py-3 rounded-lg border outline-none transition-all focus:ring-2 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-500 text-white font-semibold py-3 rounded-lg hover:bg-brand-600 transition-colors mt-6 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* New Toast Component Integration */}
      <Toast 
        isOpen={showToast} 
        onClose={() => setShowToast(false)}
        title="Login Failed"
        timeAgo="Just now"
        message={typeof errorMessage === 'string' ? errorMessage : "An error occurred. Please try again."}
      />
      
    </div>
  );
};

export default AuthPage;