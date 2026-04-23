import { Home, BookOpen, Users, GraduationCap, Wallet, Bell, ClipboardCheck, FileText, History, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Role } from "../../types";

const navigation: Record<Role, { label: string; to: string; icon: React.ReactNode }[]> = {
  admin: [
    { label: "Dashboard", to: "/admin", icon: <Home size={18} /> },
    { label: "Teachers", to: "/admin/teachers", icon: <Users size={18} /> },
    { label: "Students", to: "/admin/students", icon: <GraduationCap size={18} /> },
    { label: "Courses", to: "/admin/courses", icon: <BookOpen size={18} /> },
    { label: "Reports", to: "/admin/reports", icon: <ClipboardCheck size={18} /> },
    { label: "Payments", to: "/admin/payments", icon: <Wallet size={18} /> },
    { label: "Notifications", to: "/admin/notifications", icon: <Bell size={18} /> },
    { label: "History", to: "/admin/history", icon: <History size={18} /> }
    ,
    { label: "Settings", to: "/admin/settings", icon: <Settings size={18} /> }
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher", icon: <Home size={18} /> },
    { label: "Courses", to: "/teacher/courses", icon: <BookOpen size={18} /> },
    { label: "Attendance", to: "/teacher/attendance", icon: <ClipboardCheck size={18} /> },
    { label: "Quizzes", to: "/teacher/quizzes", icon: <FileText size={18} /> },
    { label: "Results", to: "/teacher/results", icon: <FileText size={18} /> },
    { label: "Students", to: "/teacher/students", icon: <Users size={18} /> },
    { label: "Settings", to: "/teacher/settings", icon: <Settings size={18} /> }
  ],
  student: [
    { label: "Dashboard", to: "/student", icon: <Home size={18} /> },
    { label: "Courses", to: "/student/courses", icon: <BookOpen size={18} /> },
    { label: "Attendance", to: "/student/attendance", icon: <ClipboardCheck size={18} /> },
    { label: "Results", to: "/student/results", icon: <FileText size={18} /> },
    { label: "Payments", to: "/student/payments", icon: <Wallet size={18} /> },
    { label: "Settings", to: "/student/settings", icon: <Settings size={18} /> }
  ]
};

export const Sidebar = ({ role }: { role: Role }) => (
  <aside className="panel hidden w-72 flex-shrink-0 p-4 lg:block">
    <div className="mb-8 rounded-2xl bg-brand-600 p-5 text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-brand-100">1st Rankers</p>
      <h1 className="mt-3 text-2xl font-semibold">Coaching Portal</h1>
    </div>
    <nav className="space-y-1">
      {navigation[role].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === `/${role}`}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
