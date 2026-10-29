const mongoose = require('mongoose');
const { DEPARTMENTS, PRIORITIES, TASK_STATUSES } = require('../config/constants');

// Copy of the employee's details kept on the task so that history stays
// readable after the employee is deleted.
const employeeSnapshotSchema = new mongoose.Schema(
  {
    employeeId: String,
    fullName: String,
    email: String,
    department: String,
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeSnapshot: { type: employeeSnapshotSchema, required: true },
    employeeDeleted: { type: Boolean, default: false },
    department: { type: String, required: true, enum: DEPARTMENTS },
    priority: { type: String, required: true, enum: PRIORITIES },
    priorityRank: { type: Number, required: true }, // for "sort by importance"
    status: { type: String, enum: TASK_STATUSES, default: 'Todo' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date }, // set by the backend only
  },
  { timestamps: true } // createdAt = Created Date
);

taskSchema.index({ assignedEmployee: 1, status: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
