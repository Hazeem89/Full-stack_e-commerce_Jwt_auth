import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Don't retry on login, register, or refresh endpoints
    //This is to avoid infinite loops or retrying the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/register") &&
      !originalRequest.url.includes("/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Determine the path based on the user's role
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const refreshUrl = isAdminRoute ? "/admin/refresh" : "/users/refresh";
        // Attempt to refresh the access token
        const res = await api.post(refreshUrl);
        const newAccessToken = res.data.accessToken;

        // Update the authorization header for future requests
        api.defaults.headers.Authorization = "Bearer " + newAccessToken;

        // Retry the original request with the new token
        originalRequest.headers.Authorization = "Bearer " + newAccessToken;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid - clear all user data
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('favorites');
        localStorage.removeItem('cart');

        // Clear authorization header
        delete api.defaults.headers.Authorization;

        // Redirect to appropriate login page
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin' : '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
