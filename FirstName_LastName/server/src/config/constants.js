const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
// Used to sort "by importance" instead of alphabetically.
const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
// Statuses that count towards an employee's capacity and can still be edited.
const ACTIVE_STATUSES = ['Todo', 'In Progress'];
// Single source of truth for the status flow.
const STATUS_TRANSITIONS = {
  Todo: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};
const MAX_ACTIVE_TASKS = 3;

module.exports = {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  PRIORITIES,
  PRIORITY_RANK,
  TASK_STATUSES,
  ACTIVE_STATUSES,
  STATUS_TRANSITIONS,
  MAX_ACTIVE_TASKS,
};
