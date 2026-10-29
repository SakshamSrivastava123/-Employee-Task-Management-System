const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const OPTIONS = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
  errors: { wrap: { label: false } },
};

// Validates req[source] with a Joi schema and replaces it with the cleaned value.
const validate = (schema, source = 'body') => (req, res, next) => {
  const { value, error } = schema.validate(req[source], OPTIONS);
  if (error) {
    const errors = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    const extra = errors.length - 1;
    const message =
      extra > 0 ? `${errors[0].message} (and ${extra} more issue${extra > 1 ? 's' : ''})` : errors[0].message;
    return next(ApiError.badRequest(message, errors));
  }
  if (source === 'query') req.validatedQuery = value;
  else req[source] = value;
  return next();
};

// Rejects requests that try to set backend-controlled fields.
const rejectFields = (fields, message) => (req, res, next) => {
  const found = fields.filter((f) => req.body && Object.prototype.hasOwnProperty.call(req.body, f));
  if (found.length) {
    return next(
      ApiError.badRequest(message, found.map((field) => ({ field, message: `${field} cannot be set here` })))
    );
  }
  return next();
};

const objectIdParam = (label) => (req, res, next, id) =>
  mongoose.isValidObjectId(id) && String(id).length === 24 ? next() : next(ApiError.notFound(`${label} not found`));

module.exports = { validate, rejectFields, objectIdParam };
