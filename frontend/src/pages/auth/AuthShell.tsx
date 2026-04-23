import { Link, Outlet } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";

export const AuthShell = () => (
  <div className="min-h-screen px-4 py-8">
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-panel">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-200">1st Rankers</p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight">
            Modern coaching operations for admins, teachers, and students.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Manage courses, attendance, learning materials, quiz performance, and payments from one
            responsive dashboard.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Role-aware security", "Analytics dashboards", "Search and filtering"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="panel panel-padding flex items-center">
          <div className="w-full">
            <div className="mb-6 flex gap-4 text-sm font-medium">
              <Link to="/login" className="text-brand-600">
                Login
              </Link>
              <Link to="/register" className="text-slate-500">
                Register
              </Link>
            </div>
            <Outlet />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  </div>
);
