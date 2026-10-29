const mongoose = require('mongoose');
const { DEPARTMENTS, EMPLOYEE_STATUSES, MAX_ACTIVE_TASKS } = require('../config/constants');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, enum: DEPARTMENTS },
    role: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'Active' },
    skills: { type: [String], default: [] },
    leaveStart: { type: Date },
    leaveEnd: { type: Date },
    // Number of Todo + In Progress tasks. Changed ONLY through atomic $inc in
    // capacityService, which is what makes the "max 3 active tasks" rule race-safe.
    activeTaskCount: { type: Number, default: 0, min: 0, max: MAX_ACTIVE_TASKS },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 1 });
employeeSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
