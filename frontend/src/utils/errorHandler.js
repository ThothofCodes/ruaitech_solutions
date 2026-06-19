// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
// Error handler utility for consistent error messaging

export const getErrorMessage = (error) => {
  // Handle API errors
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.status === 404) {
    return 'Resource not found';
  }
  if (error?.response?.status === 401) {
    return 'Session expired. Please log in again.';
  }
  if (error?.response?.status === 403) {
    return 'You do not have permission to access this resource';
  }
  if (error?.response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (error?.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  if (error?.response?.status >= 500) {
    return 'Server error. Our team has been notified.';
  }
  
  // Handle network errors
  if (error?.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Handle other errors
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isRetryableError = (error) => {
  const status = error?.response?.status;
  return status === 429 || status >= 500 || error?.message === 'Network Error';
};

export const handleApiError = (error, context = '') => {
  const message = getErrorMessage(error);
  if (context) {
    return `${context}: ${message}`;
  }
  return message;
};
