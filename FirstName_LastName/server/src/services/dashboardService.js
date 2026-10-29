const Employee = require('../models/Employee');
const Task = require('../models/Task');
const { todayStart, addDays } = require('../utils/dates');
const {
  ACTIVE_STATUSES,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  MAX_ACTIVE_TASKS,
  PRIORITIES,
  TASK_STATUSES,
} = require('../config/constants');
const { serializeTask } = require('./taskService');
const { isOverdue } = require('./taskRules');

const countBy = async (Model, field, keys, match = {}) => {
  const rows = await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  const result = Object.fromEntries(keys.map((k) => [k, 0]));
  rows.forEach((r) => {
    if (r._id in result) result[r._id] = r.count;
  });
  return result;
};

async function getWorkload(today, limit = 10) {
  const rows = await Employee.aggregate([
    {
      $lookup: {
        from: Task.collection.name,
        let: { id: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$assignedEmployee', '$$id'] }, { $in: ['$status', ACTIVE_STATUSES] }] } } },
          { $project: { status: 1, dueDate: 1 } },
        ],
        as: 'activeTasks',
      },
    },
    { $addFields: { activeCount: { $size: '$activeTasks' } } },
    { $sort: { activeCount: -1, fullName: 1 } },
    { $limit: limit },
  ]);

  return rows.map((e) => ({
    id: String(e._id),
    employeeId: e.employeeId,
    fullName: e.fullName,
    department: e.department,
    status: e.status,
    todo: e.activeTasks.filter((t) => t.status === 'Todo').length,
    inProgress: e.activeTasks.filter((t) => t.status === 'In Progress').length,
    overdue: e.activeTasks.filter((t) => isOverdue(t, today)).length,
    activeTasks: e.activeCount,
    capacity: MAX_ACTIVE_TASKS,
    availableSlots: Math.max(0, MAX_ACTIVE_TASKS - e.activeCount),
  }));
}

async function getDashboard() {
  const today = todayStart();
  const overdueFilter = { status: { $in: ACTIVE_STATUSES }, dueDate: { $lt: today } };
  const openFilter = { status: { $in: ACTIVE_STATUSES } };

  const [employeesByStatus, tasksByStatus, openByPriority, openByDepartment, overdueCount, dueSoon, overdueDocs, workload] =
    await Promise.all([
      countBy(Employee, 'status', EMPLOYEE_STATUSES),
      countBy(Task, 'status', TASK_STATUSES),
      countBy(Task, 'priority', PRIORITIES, openFilter),
      countBy(Task, 'department', DEPARTMENTS, openFilter),
      Task.countDocuments(overdueFilter),
      Task.countDocuments({ ...openFilter, dueDate: { $gte: today, $lte: addDays(today, 7) } }),
      Task.find(overdueFilter).sort({ dueDate: 1 }).limit(5).lean(),
      getWorkload(today),
    ]);

  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  return {
    employees: {
      total: sum(employeesByStatus),
      active: employeesByStatus.Active,
      inactive: employeesByStatus.Inactive,
      onLeave: employeesByStatus['On Leave'],
    },
    tasks: {
      total: sum(tasksByStatus),
      todo: tasksByStatus.Todo,
      inProgress: tasksByStatus['In Progress'],
      completed: tasksByStatus.Completed,
      cancelled: tasksByStatus.Cancelled,
      overdue: overdueCount,
      dueInNext7Days: dueSoon,
    },
    openTasksByPriority: openByPriority,
    openTasksByDepartment: openByDepartment,
    employeeWorkload: workload,
    overdueTasks: overdueDocs.map((t) => serializeTask(t, today)),
  };
}

module.exports = { getDashboard };
