const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const { MAX_ACTIVE_TASKS } = require('../config/constants');

/**
 * Atomically takes one of the employee's task slots.
 * The check ("count < 3") and the increment happen in ONE MongoDB operation, so two
 * simultaneous requests can never both succeed for the last free slot.
 */
async function reserveSlot(employeeId) {
  const updated = await Employee.findOneAndUpdate(
    { _id: employeeId, activeTaskCount: { $lt: MAX_ACTIVE_TASKS } },
    { $inc: { activeTaskCount: 1 } },
    { new: true }
  );
  if (updated) return updated;

  const employee = await Employee.findById(employeeId).select('fullName');
  if (!employee) throw ApiError.notFound('Assigned employee not found');
  throw ApiError.badRequest(
    `${employee.fullName} already has ${MAX_ACTIVE_TASKS} active tasks (Todo + In Progress). Complete or cancel one first, or pick another employee.`
  );
}

// Gives a slot back (task completed, cancelled, deleted or reassigned).
async function releaseSlot(employeeId) {
  await Employee.updateOne({ _id: employeeId, activeTaskCount: { $gt: 0 } }, { $inc: { activeTaskCount: -1 } });
}

module.exports = { reserveSlot, releaseSlot };
