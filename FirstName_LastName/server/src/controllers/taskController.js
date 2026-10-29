const asyncHandler = require('../utils/asyncHandler');
const { csvRow } = require('../utils/csv');
const { todayStart, toDateString } = require('../utils/dates');
const { isOverdue } = require('../services/taskRules');
const service = require('../services/taskService');

exports.list = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.listTasks(req.validatedQuery)) });
});

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getTask(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: 'Task created', data: await service.createTask(req.body) });
});

exports.update = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Task updated', data: await service.updateTask(req.params.id, req.body) });
});

exports.changeStatus = asyncHandler(async (req, res) => {
  const data = await service.changeStatus(req.params.id, req.body.status);
  res.json({ success: true, message: `Task moved to ${data.status}`, data });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.deleteTask(req.params.id);
  res.json({ success: true, message: 'Task deleted' });
});

const CSV_HEADER = [
  'Task ID', 'Title', 'Description', 'Employee ID', 'Employee Name', 'Employee Deleted', 'Department',
  'Priority', 'Status', 'Start Date', 'Due Date', 'Created Date', 'Completed Date', 'Overdue',
];

// Streams every task that matches the filters (not just one page).
exports.exportCsv = asyncHandler(async (req, res) => {
  const today = todayStart();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="tasks-${toDateString(today)}.csv"`);
  res.write(`\uFEFF${csvRow(CSV_HEADER)}\n`);

  for await (const t of service.exportCursor(req.validatedQuery)) {
    const snap = t.employeeSnapshot || {};
    res.write(
      `${csvRow([
        t.taskId, t.title, t.description, snap.employeeId, snap.fullName, t.employeeDeleted ? 'Yes' : 'No',
        t.department, t.priority, t.status, toDateString(t.startDate), toDateString(t.dueDate),
        toDateString(t.createdAt), toDateString(t.completedDate), isOverdue(t, today) ? 'Yes' : 'No',
      ])}\n`
    );
  }
  res.end();
});
