const router = require('express').Router();
const controller = require('../controllers/employeeController');
const { validate, objectIdParam } = require('../middleware/validate');
const {
  createEmployeeBody,
  updateEmployeeBody,
  listEmployeesQuery,
  lookupEmployeesQuery,
} = require('../validators/employeeValidator');

router.param('id', objectIdParam('Employee'));

router.get('/', validate(listEmployeesQuery, 'query'), controller.list);
router.get('/lookup', validate(lookupEmployeesQuery, 'query'), controller.lookup);
router.post('/', validate(createEmployeeBody), controller.create);
router.get('/:id', controller.get);
router.put('/:id', validate(updateEmployeeBody), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
