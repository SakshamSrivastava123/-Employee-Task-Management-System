export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
export const MAX_ACTIVE_TASKS = 3;
export const PAGE_SIZE = 10;

export const TASK_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date: earliest' },
  { value: 'dueDate:desc', label: 'Due date: latest' },
  { value: 'priority:desc', label: 'Priority: high to low' },
  { value: 'priority:asc', label: 'Priority: low to high' },
  { value: 'title:asc', label: 'Title: A to Z' },
  { value: 'title:desc', label: 'Title: Z to A' },
];

export const EMPLOYEE_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'fullName:asc', label: 'Name: A to Z' },
  { value: 'fullName:desc', label: 'Name: Z to A' },
  { value: 'joiningDate:desc', label: 'Joined: latest' },
  { value: 'joiningDate:asc', label: 'Joined: earliest' },
];
