const Joi = require('joi');
const { DEPARTMENTS, PRIORITIES, TASK_STATUSES } = require('../config/constants');
const { dateOnly, objectId, pagination, sortOrder } = require('./common');

// Fields the client must never send: they are controlled by the backend.
const PROTECTED_TASK_FIELDS = ['status', 'completedDate', 'taskId', 'createdAt', 'priorityRank'];

const taskBody = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().label('Title'),
  description: Joi.string().trim().allow('').max(1000).default('').label('Description'),
  assignedEmployee: objectId.required().label('Assigned Employee'),
  department: Joi.string().valid(...DEPARTMENTS).required().label('Department'),
  priority: Joi.string().valid(...PRIORITIES).required().label('Priority'),
  startDate: dateOnly.required().label('Start Date'),
  dueDate: dateOnly
    .required()
    .label('Due Date')
    .custom((value, helpers) => {
      const start = helpers.state.ancestors[0].startDate;
      if (start instanceof Date && value < start) {
        return helpers.message('Due Date cannot be earlier than Start Date');
      }
      return value;
    }),
});

const statusBody = Joi.object({
  status: Joi.string().valid(...TASK_STATUSES).required().label('Status'),
});

const taskFilterQuery = Joi.object({
  search: Joi.string().trim().max(100).empty(''),
  department: Joi.string().valid(...DEPARTMENTS).empty(''),
  priority: Joi.string().valid(...PRIORITIES).empty(''),
  status: Joi.string().valid(...TASK_STATUSES).empty(''),
  assignedEmployee: objectId.empty('').label('Employee'),
  dueFrom: dateOnly.empty('').label('Due From'),
  dueTo: dateOnly
    .empty('')
    .label('Due To')
    .custom((value, helpers) => {
      const from = helpers.state.ancestors[0].dueFrom;
      if (from instanceof Date && value < from) {
        return helpers.message('Due To cannot be earlier than Due From');
      }
      return value;
    }),
  overdue: Joi.boolean().empty(''),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'title').default('createdAt'),
  order: sortOrder,
});

const listTasksQuery = taskFilterQuery.keys(pagination);

module.exports = { taskBody, statusBody, taskFilterQuery, listTasksQuery, PROTECTED_TASK_FIELDS };
