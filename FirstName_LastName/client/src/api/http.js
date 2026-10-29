import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

// Turns any failure into an Error with a friendly `message` and per-field `fieldErrors`.
async function normalizeError(error) {
  let body = error.response?.data;
  if (body instanceof Blob) {
    try {
      body = JSON.parse(await body.text());
    } catch {
      body = null;
    }
  }
  let message = body?.message;
  if (!message) {
    if (error.code === 'ECONNABORTED') message = 'The server took too long to respond. Please try again.';
    else if (error.response) message = 'Something went wrong on the server. Please try again.';
    else message = 'Cannot reach the server. Check your connection and try again.';
  }
  const friendly = new Error(message);
  friendly.status = error.response?.status;
  friendly.fieldErrors = Object.fromEntries(
    (body?.errors || []).filter((e) => e.field).map((e) => [e.field, e.message])
  );
  return friendly;
}

http.interceptors.response.use(
  (response) => response,
  async (error) => Promise.reject(await normalizeError(error))
);

// Removes empty params so URLs and requests stay clean.
export const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export default http;
