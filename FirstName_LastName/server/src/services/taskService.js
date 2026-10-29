const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { todayStart, toDateString } = require('../utils/dates');
const { ACTIVE_STATUSES, PRIORITY_RANK, STATUS_TRANSITIONS } = require('../config/constants');
const { reserveSlot, releaseSlot } = require('./capacityService');
const {
  assertDatesValid,
  assertEmployeeAssignable,
  assertTransitionAllowed,
  isActiveStatus,
  isOverdue,
} = require('./taskRules');

const COLLATION = { locale: 'en', strength: 2 }; // case-insensitive title sort
const SORT_FIELDS = { createdAt: 'createdAt', dueDate: 'dueDate', priority: 'priorityRank', title: 'title' };

const snapshotOf = (employee) => ({
  employeeId: employee.employeeId,
  fullName: employee.fullName,
  email: employee.email,
  department: employee.department,
});

function serializeTask(doc, today = todayStart()) {
  const task = doc.toObject ? doc.toObject() : doc;
  const snap = task.employeeSnapshot || {};
  return {
    id: String(task._id),
    taskId: task.taskId,
    title: task.title,
    description: task.description,
    department: task.department,
    priority: task.priority,
    status: task.status,
    startDate: toDateString(task.startDate),
    dueDate: toDateString(task.dueDate),
    createdAt: task.createdAt,
    completedDate: task.completedDate || null,
    isOverdue: isOverdue(task, today),
    allowedNextStatuses: STATUS_TRANSITIONS[task.status] || [],
    assignedEmployee: String(task.assignedEmployee),
    employee: {
      id: String(task.assignedEmployee),
      employeeId: snap.employeeId,
      fullName: snap.fullName,
      email: snap.email,
      department: snap.department,
      deleted: Boolean(task.employeeDeleted),
    },
  };
}

async function nextTaskId() {
  const counter = await Counter.findOneAndUpdate({ _id: 'task' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `TSK-${String(counter.seq).padStart(4, '0')}`;
}

async function findEmployeeOrThrow(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound('Assigned employee not found');
  return employee;
}

// ---- filtering / sorting (all done in MongoDB) -------------------------------------------------

function buildFilter(q) {
  const filter = {};
  if (q.department) filter.department = q.department;
  if (q.priority) filter.priority = q.priority;
  if (q.assignedEmployee) filter.assignedEmployee = q.assignedEmployee;
  if (q.status) filter.status = q.status;

  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ title: rx }, { 'employeeSnapshot.fullName': rx }];
  }
  if (q.dueFrom || q.dueTo) {
    filter.dueDate = {};
    if (q.dueFrom) filter.dueDate.$gte = q.dueFrom;
    if (q.dueTo) filter.dueDate.$lte = q.dueTo;
  }
  if (q.overdue) {
    filter.status = q.status ? (isActiveStatus(q.status) ? q.status : { $in: [] }) : { $in: ACTIVE_STATUSES };
    filter.dueDate = { ...(filter.dueDate || {}), $lt: todayStart() };
  }
  return filter;
}

function buildSort(q) {
  const dir = q.order === 'asc' ? 1 : -1;
  return { [SORT_FIELDS[q.sortBy]]: dir, _id: dir };
}

async function listTasks(q) {
  const filter = buildFilter(q);
  const [docs, total] = await Promise.all([
    Task.find(filter)
      .collation(COLLATION)
      .sort(buildSort(q))
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    Task.countDocuments(filter),
  ]);
  const today = todayStart();
  return {
    data: docs.map((d) => serializeTask(d, today)),
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) },
  };
}

// Cursor over ALL tasks matching the filters (used by CSV export; no pagination).
const exportCursor = (q) => Task.find(buildFilter(q)).collation(COLLATION).sort(buildSort(q)).lean().cursor();

async function getTask(id) {
  const task = await Task.findById(id).lean();
  if (!task) throw ApiError.notFound('Task not found');
  return serializeTask(task);
}

// ---- commands ----------------------------------------------------------------------------------

async function createTask(input) {
  assertDatesValid(input.startDate, input.dueDate);
  const employee = await findEmployeeOrThrow(input.assignedEmployee);
  assertEmployeeAssignable(employee, input.startDate);

  await reserveSlot(employee._id); // atomic capacity check (max 3 active)
  try {
    const task = await Task.create({
      taskId: await nextTaskId(),
      title: input.title,
      description: input.description,
      assignedEmployee: employee._id,
      employeeSnapshot: snapshotOf(employee),
      department: input.department,
      priority: input.priority,
      priorityRank: PRIORITY_RANK[input.priority],
      status: 'Todo',
      startDate: input.startDate,
      dueDate: input.dueDate,
    });
    return serializeTask(task);
  } catch (err) {
    await releaseSlot(employee._id);
    throw err;
  }
}

async function updateTask(id, input) {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');
  if (!isActiveStatus(task.status)) {
    throw ApiError.badRequest(`${task.status} tasks cannot be edited.`);
  }
  assertDatesValid(input.startDate, input.dueDate);

  const employeeChanged = String(task.assignedEmployee) !== String(input.assignedEmployee);
  const startChanged = task.startDate.getTime() !== input.startDate.getTime();
  let newEmployee = null;

  // Re-check assignment rules only when the employee or the start date actually changes,
  // so unrelated edits are never blocked by a later change in the employee's status.
  if (employeeChanged || startChanged) {
    const employee = await findEmployeeOrThrow(employeeChanged ? input.assignedEmployee : task.assignedEmployee);
    assertEmployeeAssignable(employee, input.startDate);
    if (employeeChanged) newEmployee = employee;
  }

  if (newEmployee) await reserveSlot(newEmployee._id);

  const changes = {
    title: input.title,
    description: input.description,
    department: input.department,
    priority: input.priority,
    priorityRank: PRIORITY_RANK[input.priority],
    startDate: input.startDate,
    dueDate: input.dueDate,
  };
  if (newEmployee) {
    changes.assignedEmployee = newEmployee._id;
    changes.employeeSnapshot = snapshotOf(newEmployee);
    changes.employeeDeleted = false;
  }

  let updated;
  try {
    // The status filter guards against the task being completed/cancelled while we were validating.
    updated = await Task.findOneAndUpdate({ _id: id, status: { $in: ACTIVE_STATUSES } }, { $set: changes }, { new: true });
    if (!updated) throw ApiError.badRequest('This task was closed by someone else and can no longer be edited.');
  } catch (err) {
    if (newEmployee) await releaseSlot(newEmployee._id);
    throw err;
  }
  if (newEmployee) await releaseSlot(task.assignedEmployee);
  return serializeTask(updated);
}

async function changeStatus(id, nextStatus) {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');
  assertTransitionAllowed(task.status, nextStatus);

  const changes = { status: nextStatus };
  if (nextStatus === 'Completed') changes.completedDate = new Date(); // backend clock only

  // Conditional update: succeeds only if nobody changed the status since we read it.
  const updated = await Task.findOneAndUpdate({ _id: id, status: task.status }, { $set: changes }, { new: true });
  if (!updated) {
    throw ApiError.badRequest('The task status was changed by another request. Refresh and try again.');
  }
  if (!isActiveStatus(nextStatus)) await releaseSlot(task.assignedEmployee);
  return serializeTask(updated);
}

async function deleteTask(id) {
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw ApiError.notFound('Task not found');
  if (isActiveStatus(task.status)) await releaseSlot(task.assignedEmployee);
}

module.exports = {
  listTasks,
  exportCursor,
  getTask,
  createTask,
  updateTask,
  changeStatus,
  deleteTask,
  serializeTask,
  snapshotOf,
};
