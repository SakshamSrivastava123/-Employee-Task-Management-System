const Employee = require('../models/Employee');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { toDateString } = require('../utils/dates');
const { ACTIVE_STATUSES } = require('../config/constants');

const COLLATION = { locale: 'en', strength: 2 };

function serializeEmployee(doc) {
  const e = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(e._id),
    employeeId: e.employeeId,
    fullName: e.fullName,
    email: e.email,
    phone: e.phone,
    department: e.department,
    role: e.role,
    joiningDate: toDateString(e.joiningDate),
    status: e.status,
    skills: e.skills || [],
    leaveStart: toDateString(e.leaveStart),
    leaveEnd: toDateString(e.leaveEnd),
    activeTaskCount: e.activeTaskCount || 0,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

const dedupeSkills = (skills = []) => {
  const seen = new Set();
  return skills.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function searchFilter(search) {
  const rx = new RegExp(escapeRegex(search), 'i');
  return [{ fullName: rx }, { email: rx }, { employeeId: rx }];
}

async function listEmployees(q) {
  const filter = {};
  if (q.department) filter.department = q.department;
  if (q.status) filter.status = q.status;
  if (q.search) filter.$or = searchFilter(q.search);

  const dir = q.order === 'asc' ? 1 : -1;
  const [docs, total] = await Promise.all([
    Employee.find(filter)
      .collation(COLLATION)
      .sort({ [q.sortBy]: dir, _id: dir })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    Employee.countDocuments(filter),
  ]);
  return {
    data: docs.map(serializeEmployee),
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) },
  };
}

// Small list for the "Assigned Employee" dropdown.
async function lookupEmployees(q) {
  const filter = {};
  if (!q.includeInactive) filter.status = { $ne: 'Inactive' };
  if (q.search) filter.$or = searchFilter(q.search);
  const docs = await Employee.find(filter).collation(COLLATION).sort({ fullName: 1 }).limit(100).lean();
  return docs.map(serializeEmployee);
}

async function getEmployee(id) {
  const employee = await Employee.findById(id).lean();
  if (!employee) throw ApiError.notFound('Employee not found');
  return serializeEmployee(employee);
}

async function createEmployee(input) {
  const employee = await Employee.create({ ...input, skills: dedupeSkills(input.skills) });
  return serializeEmployee(employee);
}

async function updateEmployee(id, input) {
  const changes = { ...input, skills: dedupeSkills(input.skills) };
  const unset = {};
  if (input.status !== 'On Leave') {
    unset.leaveStart = '';
    unset.leaveEnd = '';
  }
  const update = { $set: changes };
  if (Object.keys(unset).length) update.$unset = unset;

  const employee = await Employee.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!employee) throw ApiError.notFound('Employee not found');

  // Keep the copy of employee details on their tasks fresh (used for display and search).
  await Task.updateMany(
    { assignedEmployee: employee._id },
    {
      $set: {
        employeeSnapshot: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
        },
      },
    }
  );
  return serializeEmployee(employee);
}

async function deleteEmployee(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound('Employee not found');

  const openTasks = await Task.countDocuments({ assignedEmployee: id, status: { $in: ACTIVE_STATUSES } });
  if (openTasks > 0) {
    throw ApiError.badRequest(
      `${employee.fullName} still has ${openTasks} Todo / In Progress task${openTasks > 1 ? 's' : ''}. Reassign, complete or cancel them before deleting this employee.`
    );
  }

  // Atomic guard: if a task slot was taken a moment ago, activeTaskCount > 0 and nothing is deleted.
  const deleted = await Employee.findOneAndDelete({ _id: id, activeTaskCount: 0 });
  if (!deleted) {
    throw ApiError.badRequest('This employee was just assigned a task, so they cannot be deleted right now.');
  }

  // Old tasks keep readable employee details (snapshot) and are flagged as deleted.
  await Task.updateMany(
    { assignedEmployee: id },
    {
      $set: {
        employeeDeleted: true,
        employeeSnapshot: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
        },
      },
    }
  );
}

module.exports = {
  listEmployees,
  lookupEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  serializeEmployee,
};
