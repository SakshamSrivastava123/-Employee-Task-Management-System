require('dotenv').config();
const connectDb = require('./config/db');
const app = require('./app');
const Employee = require('./models/Employee');
const Task = require('./models/Task');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDb();
  // Make sure unique indexes exist before accepting traffic (409 handling relies on them).
  await Promise.all([Employee.init(), Task.init()]);
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
