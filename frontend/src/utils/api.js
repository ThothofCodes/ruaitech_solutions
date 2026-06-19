// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import axios from 'axios';

// FIX (image upload investigation): both instances used to set a blanket
// `Content-Type: application/json` default header. Axios does not strip or
// override an explicitly-set default header just because the request body is
// a FormData instance — so every product image upload (`api.post('/products', fd)`
// in pages/Products.js) was sent as `Content-Type: application/json` with a
// multipart body. Express/multer can't find a boundary in that header, so
// req.files arrived empty before the request ever reached the (also broken,
// separately fixed) multer-storage-cloudinary layer. Removing the default and
// setting it conditionally lets the browser auto-generate the correct
// `multipart/form-data; boundary=...` header for FormData payloads, while
// JSON requests still get `application/json` explicitly.
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30s timeout — prevents hanging requests
});

const publicApi = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

function setContentTypeByPayload(config) {
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData) {
    // Let the browser set 'multipart/form-data; boundary=...' itself —
    // explicitly deleting any prior value is what makes this actually work.
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}

api.interceptors.request.use(setContentTypeByPayload);
publicApi.interceptors.request.use(setContentTypeByPayload);

// ── Request interceptor — attach token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Basic token format validation before sending
      if (typeof token === 'string' && token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Malformed token — clear it
        localStorage.removeItem('token');
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor — handle auth errors ─────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export { api, publicApi };
