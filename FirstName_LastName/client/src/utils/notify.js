import toast from 'react-hot-toast';

export const notifySuccess = (message) => toast.success(message);
export const notifyError = (error, fallback = 'Something went wrong. Please try again.') =>
  toast.error(error?.message || fallback);
