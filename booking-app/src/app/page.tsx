import { cookies } from "next/headers";
import ClientLogin from "@/components/ClientLogin";

export default async function HomePage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  // Do not auto-redirect; keep login visible even if already authenticated

  return (
  <main className="h-screen flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-400 via-purple-200 to-sky-300" style={{backgroundSize: '200% 200%'}}></div>
  <header className="w-full flex justify-center pt-2 pb-2 fixed top-0 left-0 z-20 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 shadow flex items-center justify-center">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#3b82f6" fontWeight="bold">P</text></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-700">Phasis Booking</span>
        </div>
      </header>

      <section className="flex flex-col items-center w-full mt-20">
        <div className="rounded-lg shadow-lg bg-white/80 backdrop-blur-lg border border-blue-200 p-2 w-full max-w-[220px] mx-auto transition-all duration-500">
          <ClientLogin />
        </div>
      </section>

      {/* Features section and cards removed for minimal view */}
      <section className="w-full flex flex-col items-center fixed bottom-0 left-0 z-10 pb-6">
        <div className="max-w-xl text-center px-4 py-4 rounded-xl bg-white/70 backdrop-blur border border-blue-100 shadow-lg">
          <h2 className="text-base font-semibold text-blue-700 mb-1 drop-shadow">Effortless Booking. Smarter Management.</h2>
          <p className="text-xs text-gray-700 mb-1">PhasisBooking streamlines your room reservations with instant availability, secure access, and a beautiful interface. Join hundreds of happy users who save time and stay organized every day.</p>
          <div className="flex justify-center gap-2 mt-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium shadow">Fast Setup</span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium shadow">Secure Access</span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-medium shadow">24/7 Support</span>
          </div>
        </div>
      </section>
    </main>
  );
}