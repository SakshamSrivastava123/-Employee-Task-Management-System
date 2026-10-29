const Joi = require('joi');

// 'YYYY-MM-DD' -> Date at UTC midnight. Rejects impossible dates like 2026-02-30.
const dateOnly = Joi.string()
  .trim()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      return helpers.error('any.invalid');
    }
    return date;
  })
  .messages({
    'string.pattern.base': '{{#label}} must be a date in YYYY-MM-DD format',
    'any.invalid': '{{#label}} is not a valid date',
  });

const objectId = Joi.string()
  .hex()
  .length(24)
  .messages({
    'string.hex': '{{#label}} is not a valid id',
    'string.length': '{{#label}} is not a valid id',
  });

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

const sortOrder = Joi.string().valid('asc', 'desc').default('desc');

module.exports = { dateOnly, objectId, pagination, sortOrder };
