import { LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ProfileAvatar } from "./ProfileAvatar";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <Sidebar role={user.role} />
        <div className="flex-1 space-y-6">
          <header className="panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{user.name}</h2>
              <p className="text-sm capitalize text-brand-600 dark:text-brand-300">{user.role} portal</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ProfileAvatar />
              <ThemeToggle />
              <button type="button" onClick={logout} className="btn-secondary gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
