import { cookies } from "next/headers";
import ClientLogin from "@/components/ClientLogin";

export default async function HomePage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  // Do not auto-redirect; keep login visible even if already authenticated

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-violet-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 to-sky-500" />
            <span className="font-semibold tracking-tight">Phasis Booking</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
            <a href="#contact" className="hover:text-gray-900">Contact</a>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Book beautiful stays with ease
              </h1>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                Manage rooms, track availability, and create bookings in seconds. A simple, fast, and reliable hotel booking experience.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-500/90 text-white grid place-items-center text-[10px]">✓</span>
                  Real-time overlap checks prevent double bookings
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-500/90 text-white grid place-items-center text-[10px]">✓</span>
                  Separate dashboards for admins and clients
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-500/90 text-white grid place-items-center text-[10px]">✓</span>
                  Quick room and booking management
                </li>
              </ul>
            </div>

            <div className="md:justify-self-end w-full max-w-sm">
              <div className="border rounded-xl shadow-sm bg-white/70 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-4">Sign in</h2>
                <ClientLogin />
                <p className="text-xs text-gray-500 mt-3">Create an account or sign in to continue.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-violet-500 to-fuchsia-500 mb-3" />
            <h3 className="font-semibold">Smart availability</h3>
            <p className="text-sm text-gray-600 mt-1">Instant conflict detection keeps your calendar clean.</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-sky-500 to-cyan-500 mb-3" />
            <h3 className="font-semibold">Effortless management</h3>
            <p className="text-sm text-gray-600 mt-1">Create, update, and track rooms and bookings quickly.</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 mb-3" />
            <h3 className="font-semibold">Role-based access</h3>
            <p className="text-sm text-gray-600 mt-1">Admin and client views tailored to each user.</p>
          </div>
        </div>
      </section>
    </main>
  );
}