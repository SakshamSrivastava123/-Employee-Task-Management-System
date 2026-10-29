const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/employeeService');

exports.list = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.listEmployees(req.validatedQuery)) });
});

exports.lookup = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.lookupEmployees(req.validatedQuery) });
});

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getEmployee(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: 'Employee created', data: await service.createEmployee(req.body) });
});

exports.update = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Employee updated', data: await service.updateEmployee(req.params.id, req.body) });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.deleteEmployee(req.params.id);
  res.json({ success: true, message: 'Employee deleted' });
});
