import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Queue Cure '26 — Real-Time Queue Management System",
  description:
    "Welcome to Queue Cure '26. Choose your role: Receptionist Dashboard or Patient Waiting Room.",
};

export default function Home() {
  return (
    <main className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Logo / Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/30 mb-6 glow-brand">
            <svg className="w-10 h-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Queue Cure&nbsp;&apos;26</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Real-time patient queue management system.<br />
            Choose your role to get started.
          </p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/receptionist"
            id="btn-receptionist"
            className="group card hover:bg-white/8 hover:border-brand-500/30 transition-all duration-300 text-left no-underline block"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-100 mb-1">Receptionist</h2>
            <p className="text-xs text-slate-500">Manage the queue, add patients, call next</p>
            <div className="mt-4 text-brand-400 text-xs font-semibold flex items-center gap-1">
              Open Dashboard
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/waiting-room"
            id="btn-waiting-room"
            className="group card hover:bg-white/8 hover:border-emerald-500/30 transition-all duration-300 text-left no-underline block"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-100 mb-1">Waiting Room</h2>
            <p className="text-xs text-slate-500">Track your token and estimated wait time</p>
            <div className="mt-4 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              Enter Room
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>


      </div>
    </main>
  );
}
