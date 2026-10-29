const router = require('express').Router();
const controller = require('../controllers/taskController');
const { validate, rejectFields, objectIdParam } = require('../middleware/validate');
const {
  taskBody,
  statusBody,
  taskFilterQuery,
  listTasksQuery,
  PROTECTED_TASK_FIELDS,
} = require('../validators/taskValidator');

const PROTECTED_MESSAGE =
  'Status, Task ID, Completed Date and Created Date cannot be set here. Use PUT /api/tasks/:id/status to change the status.';

router.param('id', objectIdParam('Task'));

router.get('/', validate(listTasksQuery, 'query'), controller.list);
router.get('/export', validate(taskFilterQuery, 'query'), controller.exportCsv); // before /:id
router.post('/', rejectFields(PROTECTED_TASK_FIELDS, PROTECTED_MESSAGE), validate(taskBody), controller.create);
router.get('/:id', controller.get);
router.put('/:id/status', validate(statusBody), controller.changeStatus);
router.put('/:id', rejectFields(PROTECTED_TASK_FIELDS, PROTECTED_MESSAGE), validate(taskBody), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
