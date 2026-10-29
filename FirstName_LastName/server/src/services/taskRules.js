const ApiError = require('../utils/ApiError');
const { toDateString } = require('../utils/dates');
const { ACTIVE_STATUSES, STATUS_TRANSITIONS } = require('../config/constants');

function assertDatesValid(startDate, dueDate) {
  if (dueDate < startDate) throw ApiError.badRequest('Due Date cannot be earlier than Start Date');
}

/** Inactive: always rejected. On Leave: rejected only if Start Date is inside the leave period (inclusive). */
function assertEmployeeAssignable(employee, startDate) {
  if (employee.status === 'Inactive') {
    throw ApiError.badRequest(`${employee.fullName} is Inactive and cannot be assigned tasks.`);
  }
  if (employee.status === 'On Leave' && employee.leaveStart && employee.leaveEnd) {
    if (startDate >= employee.leaveStart && startDate <= employee.leaveEnd) {
      throw ApiError.badRequest(
        `${employee.fullName} is on leave from ${toDateString(employee.leaveStart)} to ${toDateString(
          employee.leaveEnd
        )}. The task Start Date falls inside that period.`
      );
    }
  }
}

function assertTransitionAllowed(from, to) {
  const allowed = STATUS_TRANSITIONS[from] || [];
  if (allowed.includes(to)) return;
  if (!allowed.length) {
    throw ApiError.badRequest(`A ${from} task can no longer change status.`);
  }
  throw ApiError.badRequest(
    `Cannot move a task from "${from}" to "${to}". Allowed next status: ${allowed.join(' or ')}.`
  );
}

const isActiveStatus = (status) => ACTIVE_STATUSES.includes(status);

// Overdue = today is later than Due Date and the task is still open.
const isOverdue = (task, today) => isActiveStatus(task.status) && today.getTime() > new Date(task.dueDate).getTime();

module.exports = { assertDatesValid, assertEmployeeAssignable, assertTransitionAllowed, isActiveStatus, isOverdue };
