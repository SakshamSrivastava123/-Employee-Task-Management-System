const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

const FIELD_LABELS = { employeeId: 'Employee ID', email: 'Email', taskId: 'Task ID' };

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.name === 'ValidationError' && !(err instanceof ApiError)) {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors[0] ? errors[0].message : 'Validation failed';
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'value';
    const label = FIELD_LABELS[key] || key;
    message = `${label} already exists`;
    errors = [{ field: key, message }];
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body';
  }

  if (status >= 500) {
    console.error(err);
    message = 'Internal server error';
    errors = undefined;
  }

  res.status(status).json({ success: false, message, errors });
};

module.exports = { notFound, errorHandler };
