import { Link, Outlet } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";

export const AuthShell = () => (
  <div className="min-h-screen px-4 py-8">
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex min-h-[320px] items-center justify-center rounded-[2rem] bg-slate-950 p-8 text-white shadow-panel lg:min-h-[520px]">
          <p className="absolute left-8 top-8 text-sm uppercase tracking-[0.35em] text-brand-200">1st Rankers</p>
          <div className="flex h-[480px] w-[480px] items-center justify-center overflow-hidden lg:h-[360px] lg:w-[360px]">
            <div className="flex h-[380px] w-[280px] items-center justify-center  rounded-[1.5rem]">
              <img
                src="/brand/auth-logo.jpg"
                alt="1st Rankers logo"
                className="h-full w-full scale-[2.2] object-cover"   
             />
            </div>
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
