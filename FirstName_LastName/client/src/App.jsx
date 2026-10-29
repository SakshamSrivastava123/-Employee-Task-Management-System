import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import EmployeeListPage from './pages/employees/EmployeeListPage.jsx';
import EmployeeFormPage from './pages/employees/EmployeeFormPage.jsx';
import EmployeeViewPage from './pages/employees/EmployeeViewPage.jsx';
import TaskListPage from './pages/tasks/TaskListPage.jsx';
import TaskFormPage from './pages/tasks/TaskFormPage.jsx';
import TaskViewPage from './pages/tasks/TaskViewPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/:id" element={<EmployeeViewPage />} />
          <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path="tasks" element={<TaskListPage />} />
          <Route path="tasks/new" element={<TaskFormPage />} />
          <Route path="tasks/:id" element={<TaskViewPage />} />
          <Route path="tasks/:id/edit" element={<TaskFormPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 4500 }} />
    </>
  );
}
