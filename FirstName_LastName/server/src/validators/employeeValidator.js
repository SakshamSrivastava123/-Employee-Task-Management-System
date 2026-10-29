const Joi = require('joi');
const { DEPARTMENTS, EMPLOYEE_STATUSES } = require('../config/constants');
const { dateOnly, pagination, sortOrder } = require('./common');

const phone = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const digits = value.replace(/[\s\-()]/g, '');
    return /^\+?\d{7,15}$/.test(digits) ? digits : helpers.error('phone.invalid');
  })
  .messages({ 'phone.invalid': 'Phone must contain 7-15 digits (an optional leading + is allowed)' });

const leaveEnd = dateOnly
  .empty('')
  .required()
  .label('Leave End')
  .custom((value, helpers) => {
    const start = helpers.state.ancestors[0].leaveStart;
    if (start instanceof Date && value < start) {
      return helpers.message('Leave End cannot be earlier than Leave Start');
    }
    return value;
  });

const employeeFields = {
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .pattern(/^\p{L}[\p{L}\s.'-]*$/u)
    .required()
    .label('Full Name')
    .messages({ 'string.pattern.base': 'Full Name may contain only letters, spaces, . - and \'' }),
  email: Joi.string()
    .trim()
    .lowercase()
    .max(120)
    .email({ tlds: { allow: false } })
    .required()
    .label('Email'),
  phone: phone.required().label('Phone'),
  department: Joi.string().valid(...DEPARTMENTS).required().label('Department'),
  role: Joi.string().trim().min(2).max(60).required().label('Role'),
  joiningDate: dateOnly.required().label('Joining Date'),
  status: Joi.string().valid(...EMPLOYEE_STATUSES).default('Active').label('Status'),
  skills: Joi.array()
    .items(Joi.string().trim().min(1).max(40))
    .max(15)
    .default([])
    .label('Skills'),
  // Leave dates are required only when On Leave, and dropped otherwise.
  leaveStart: Joi.when('status', {
    is: 'On Leave',
    then: dateOnly.empty('').required().label('Leave Start'),
    otherwise: Joi.any().strip(),
  }),
  leaveEnd: Joi.when('status', {
    is: 'On Leave',
    then: leaveEnd,
    otherwise: Joi.any().strip(),
  }),
};

const employeeId = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z0-9_-]{2,20}$/)
  .required()
  .label('Employee ID')
  .messages({
    'string.pattern.base': 'Employee ID may contain letters, numbers, - and _ (2-20 characters)',
  });

const createEmployeeBody = Joi.object({ employeeId, ...employeeFields });
// Employee ID is immutable after creation (tasks keep a snapshot of it).
const updateEmployeeBody = Joi.object(employeeFields);

const listEmployeesQuery = Joi.object({
  ...pagination,
  search: Joi.string().trim().max(100).empty(''),
  department: Joi.string().valid(...DEPARTMENTS).empty(''),
  status: Joi.string().valid(...EMPLOYEE_STATUSES).empty(''),
  sortBy: Joi.string().valid('createdAt', 'fullName', 'joiningDate', 'employeeId').default('createdAt'),
  order: sortOrder,
});

const lookupEmployeesQuery = Joi.object({
  search: Joi.string().trim().max(100).empty(''),
  includeInactive: Joi.boolean().default(false),
});

module.exports = { createEmployeeBody, updateEmployeeBody, listEmployeesQuery, lookupEmployeesQuery };
