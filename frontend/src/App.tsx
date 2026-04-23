import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { SettingsForm } from "./components/shared/SettingsForm";
import { useAuth } from "./hooks/useAuth";
import { AdminCoursesPage, AdminDashboardPage, AdminHistoryPage, AdminNotificationsPage, AdminPaymentsPage, AdminReportsPage, AdminStudentsPage, AdminTeachersPage } from "./pages/admin";
import { AuthShell } from "./pages/auth/AuthShell";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { StudentAttendancePage, StudentCoursesPage, StudentDashboardPage, StudentPaymentsPage, StudentResultsPage } from "./pages/student";
import { TeacherAttendancePage, TeacherCoursesPage, TeacherDashboardPage, TeacherQuizzesPage, TeacherResultsPage, TeacherStudentsPage } from "./pages/teacher";
import { Role } from "./types";

const ProtectedRoute = ({ role }: { role?: Role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <DashboardLayout />;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}` : "/login"} replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<AuthShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="teachers" element={<AdminTeachersPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="history" element={<AdminHistoryPage />} />
        <Route path="settings" element={<SettingsForm role="admin" />} />
      </Route>

      <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
        <Route index element={<TeacherDashboardPage />} />
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="attendance" element={<TeacherAttendancePage />} />
        <Route path="quizzes" element={<TeacherQuizzesPage />} />
        <Route path="results" element={<TeacherResultsPage />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="settings" element={<SettingsForm role="teacher" />} />
      </Route>

      <Route path="/student" element={<ProtectedRoute role="student" />}>
        <Route index element={<StudentDashboardPage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="payments" element={<StudentPaymentsPage />} />
        <Route path="settings" element={<SettingsForm role="student" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
