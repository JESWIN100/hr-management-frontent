import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `http://localhost:5000`,
});

// Add an interceptor to automatically attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    // Grab the token from sessionStorage (where AuthPage saves it)
    const token = sessionStorage.getItem("TOKEN");
    
    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const IMAGE_BASE_URL = 'http://localhost:5000/uploads/';