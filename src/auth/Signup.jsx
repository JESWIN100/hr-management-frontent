import React from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../config/axiosInstance';
// Import your axios instance (adjust the path to match your project structure)


export default function Register() {
  // Initialize react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  // Handle the form submission
  const onSubmit = async (data) => {
    try {
      // Replace '/register' with your actual API endpoint
      const response = await axiosInstance.post('/api/auth/signup', data);
      
      console.log('Account created successfully:', response.data);
      // Add your success logic here (e.g., toast notification, redirect to login)
      
    } catch (error) {
      console.error('Registration failed:', error);
      // Add your error handling logic here
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-end pr-4 md:pr-20 p-4 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1644088379091-d574269d422f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVjaG5vbG9neXxlbnwwfHwwfHx8MA%3D%3D')" 
      }}
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-2">Set up your company's HR workspace</p>
        </div>
        
        {/* Pass the onSubmit function to handleSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="John Doe"
              {...register('name', { required: 'Full name is required' })}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Work Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
            <input 
              type="email" 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="john@company.com"
              {...register('email', { 
                required: 'Work email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          
          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Create a strong password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long'
                }
              })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <a href="/login" className="text-blue-600 font-medium hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}