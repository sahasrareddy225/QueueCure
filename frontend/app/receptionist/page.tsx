"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Patient, fetchQueueState, addPatient, callNextPatient, updateAvgTime } from "../lib/api";
import { getSocket } from "../lib/socket";
import { QueueTable } from "../components/QueueTable";
import { TokenBadge } from "../components/TokenBadge";

// ── Types ─────────────────────────────────────────────────────────────────────



// ── Receptionist Page ─────────────────────────────────────────────────────────

export default function ReceptionistPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [avgTime, setAvgTime] = useState<number>(10);
  const [avgTimeInput, setAvgTimeInput] = useState<string>("10");
  const [patientName, setPatientName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const callCooldown = useRef(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ── Flash helpers ────────────────────────────────────────────────────────
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── Load initial state from DB ───────────────────────────────────────────
  useEffect(() => {
    const loadState = async () => {
      try {
        const data = await fetchQueueState();
        setCurrentPatient(data.currentPatient);
        setWaitingQueue(data.queue);
        setAllPatients(data.allPatients);
        setAvgTime(data.avgTime);
        setAvgTimeInput(String(data.avgTime));
      } catch (err) {
        showError("Failed to load queue state. Check backend connection.");
        console.error(err);
      }
    };
    loadState();
  }, []);

  // ── Socket subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch (err) {
      showError("Socket config error: " + (err as Error).message);
      return;
    }



    socket.on("queue_updated", (data: { queue: Patient[]; avgTime: number }) => {
      setWaitingQueue(data.queue);
      if (data.avgTime !== undefined) setAvgTime(data.avgTime);
      // Refresh full list
      fetchQueueState().then((full) => {
        setAllPatients(full.allPatients);
      }).catch(() => {});
    });

    socket.on(
      "current_token_changed",
      (data: { currentPatient: Patient | null; queue: Patient[]; avgTime: number }) => {
        setCurrentPatient(data.currentPatient);
        setWaitingQueue(data.queue);
        if (data.avgTime !== undefined) setAvgTime(data.avgTime);
        fetchQueueState().then((full) => {
          setAllPatients(full.allPatients);
        }).catch(() => {});
      }
    );

    socket.on("patient_added", () => {
      // Full refresh on new patient
      fetchQueueState().then((full) => {
        setAllPatients(full.allPatients);
        setWaitingQueue(full.queue);
        setCurrentPatient(full.currentPatient);
      }).catch(() => {});
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("queue_updated");
      socket.off("current_token_changed");
      socket.off("patient_added");
    };
  }, []);

  // ── Add patient ──────────────────────────────────────────────────────────
  const handleAddPatient = useCallback(async () => {
    if (!patientName.trim() || isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      const { patient } = await addPatient(patientName.trim());
      setPatientName("");
      showSuccess(`✅ Patient ${patient.name} added — Token #${patient.tokenNumber.toString().padStart(2, "0")}`);
      nameInputRef.current?.focus();
    } catch (err) {
      showError((err as Error).message || "Failed to add patient");
    } finally {
      setIsAdding(false);
    }
  }, [patientName, isAdding]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddPatient();
  };

  // ── Call next ────────────────────────────────────────────────────────────
  const handleCallNext = useCallback(async () => {
    // Double-click prevention with cooldown
    if (isCalling || callCooldown.current) return;
    callCooldown.current = true;
    setIsCalling(true);
    setError(null);
    try {
      const result = await callNextPatient();
      if (result.message === "Queue is empty") {
        showSuccess("Queue is empty — no more patients");
      } else if (result.currentPatient) {
        showSuccess(`📢 Now serving Token #${result.currentPatient.tokenNumber.toString().padStart(2, "0")} — ${result.currentPatient.name}`);
      }
    } catch (err) {
      showError((err as Error).message || "Failed to call next patient");
    } finally {
      setIsCalling(false);
      setTimeout(() => { callCooldown.current = false; }, 2000);
    }
  }, [isCalling]);

  // ── Avg time update ──────────────────────────────────────────────────────
  const handleAvgTimeUpdate = useCallback(async () => {
    const val = parseInt(avgTimeInput, 10);
    if (isNaN(val) || val < 1 || val > 120) {
      showError("Avg time must be between 1 and 120 minutes");
      return;
    }
    try {
      const { avgTime: updated } = await updateAvgTime(val);
      setAvgTime(updated);
      showSuccess(`⏱ Avg consultation time set to ${updated} minutes`);
    } catch (err) {
      showError((err as Error).message || "Failed to update avg time");
    }
  }, [avgTimeInput]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const completedCount = allPatients.filter((p) => p.status === "completed").length;
  const displayedPatients = showCompleted ? allPatients : allPatients.filter((p) => p.status !== "completed");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mesh-bg">
      {/* Fixed background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-slate-500 text-xs hover:text-slate-300 transition-colors mb-1 inline-block">
              ← Home
            </Link>
            <h1 className="text-2xl font-bold text-gradient">Receptionist Dashboard</h1>
            <p className="text-slate-500 text-xs mt-0.5">Queue Cure &apos;26 — Real-time Queue Management</p>
          </div>


        </header>

        {/* ── Toast messages ──────────────────────────────────────────────── */}
        {(error || successMsg) && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up ${
              error
                ? "bg-red-500/10 border border-red-500/30 text-red-300"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
            }`}
          >
            {error || successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Current Token Card */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Currently Serving
              </h2>
              {currentPatient ? (
                <div className="flex flex-col items-center gap-3">
                  <TokenBadge
                    token={currentPatient.tokenNumber}
                    size="xl"
                    variant="current"
                    label="Token"
                  />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-100">{currentPatient.name}</p>
                    <p className="text-xs text-emerald-400/80 mt-0.5 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                      In Progress
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">No active token</p>
                </div>
              )}
            </div>

            {/* Stats card */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Queue Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-brand-300">{waitingQueue.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Waiting</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Completed</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center col-span-2">
                  <p className="text-2xl font-bold text-slate-300">{allPatients.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Today</p>
                </div>
              </div>
            </div>

            {/* Avg time card */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Avg Consultation Time
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="input-avg-time"
                    type="number"
                    min={1}
                    max={120}
                    value={avgTimeInput}
                    onChange={(e) => setAvgTimeInput(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Minutes"
                    onKeyDown={(e) => e.key === "Enter" && handleAvgTimeUpdate()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">min</span>
                </div>
                <button
                  id="btn-update-avg-time"
                  onClick={handleAvgTimeUpdate}
                  className="btn-ghost px-3"
                  aria-label="Update average time"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Current: <span className="text-brand-400 font-semibold">{avgTime} minutes</span> per patient
              </p>
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Add Patient + Call Next */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Actions
              </h2>
              <div className="flex gap-3 mb-4">
                <input
                  id="input-patient-name"
                  ref={nameInputRef}
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter patient name..."
                  className="input-field flex-1"
                  maxLength={100}
                  disabled={isAdding}
                  aria-label="Patient name input"
                />
                <button
                  id="btn-add-patient"
                  onClick={handleAddPatient}
                  disabled={!patientName.trim() || isAdding}
                  className="btn-primary whitespace-nowrap"
                >
                  {isAdding ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Patient
                    </>
                  )}
                </button>
              </div>

              <button
                id="btn-call-next"
                onClick={handleCallNext}
                disabled={isCalling || callCooldown.current || waitingQueue.length === 0}
                className="btn-emerald w-full py-4 text-base"
              >
                {isCalling ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Calling...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Call Next Patient
                    {waitingQueue.length > 0 && (
                      <span className="ml-1 bg-white/20 rounded-full px-2 py-0.5 text-xs">
                        {waitingQueue.length} waiting
                      </span>
                    )}
                  </>
                )}
              </button>
              {waitingQueue.length === 0 && !isCalling && (
                <p className="text-center text-xs text-slate-600 mt-2">No patients in queue</p>
              )}
            </div>

            {/* Queue table */}
            <div className="card flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Patient Queue
                </h2>
                <button
                  id="btn-toggle-completed"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showCompleted ? "Hide completed" : `Show completed (${completedCount})`}
                </button>
              </div>
              <QueueTable patients={displayedPatients} showAll={showCompleted} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
