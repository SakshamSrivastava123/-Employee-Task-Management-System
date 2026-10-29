// Mirrors the backend (Joi) rules so users get instant feedback. The backend remains the authority.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME = /^\p{L}[\p{L}\s.'-]*$/u;
const EMPLOYEE_ID = /^[A-Za-z0-9_-]{2,20}$/;

const isValidPhone = (value) => /^\+?\d{7,15}$/.test(value.replace(/[\s\-()]/g, ''));

export function validateEmployee(v, { isEdit }) {
  const e = {};
  if (!isEdit && !EMPLOYEE_ID.test(v.employeeId.trim())) {
    e.employeeId = 'Use 2-20 letters, numbers, - or _';
  }
  const name = v.fullName.trim();
  if (!name) e.fullName = 'Full name is required';
  else if (name.length < 2 || name.length > 80) e.fullName = 'Full name must be 2-80 characters';
  else if (!NAME.test(name)) e.fullName = "Use letters, spaces, . - and ' only";

  if (!v.email.trim()) e.email = 'Email is required';
  else if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address';

  if (!v.phone.trim()) e.phone = 'Phone is required';
  else if (!isValidPhone(v.phone)) e.phone = 'Enter 7-15 digits (optional + prefix)';

  if (!v.department) e.department = 'Select a department';
  if (v.role.trim().length < 2) e.role = 'Role must be at least 2 characters';
  if (!v.joiningDate) e.joiningDate = 'Joining date is required';

  if (v.status === 'On Leave') {
    if (!v.leaveStart) e.leaveStart = 'Leave start is required';
    if (!v.leaveEnd) e.leaveEnd = 'Leave end is required';
    else if (v.leaveStart && v.leaveEnd < v.leaveStart) e.leaveEnd = 'Leave end cannot be before leave start';
  }
  return e;
}

export function validateTask(v) {
  const e = {};
  const title = v.title.trim();
  if (title.length < 3) e.title = 'Title must be at least 3 characters';
  else if (title.length > 120) e.title = 'Title cannot exceed 120 characters';
  if (v.description.length > 1000) e.description = 'Description cannot exceed 1000 characters';
  if (!v.assignedEmployee) e.assignedEmployee = 'Select an employee';
  if (!v.department) e.department = 'Select a department';
  if (!v.priority) e.priority = 'Select a priority';
  if (!v.startDate) e.startDate = 'Start date is required';
  if (!v.dueDate) e.dueDate = 'Due date is required';
  else if (v.startDate && v.dueDate < v.startDate) e.dueDate = 'Due date cannot be earlier than start date';
  return e;
}
