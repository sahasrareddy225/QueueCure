"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Patient, fetchQueueState } from "../lib/api";
import { getSocket } from "../lib/socket";
import { TokenBadge } from "../components/TokenBadge";
import { WaitTimeBanner } from "../components/WaitTimeBanner";



export default function WaitingRoomPage() {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<Patient[]>([]);
  const [avgTime, setAvgTime] = useState<number>(10);

  const [error, setError] = useState<string | null>(null);

  // Token entry state
  const [tokenInput, setTokenInput] = useState("");
  const [myToken, setMyToken] = useState<number | null>(null);
  const [tokenError, setTokenError] = useState("");

  // ── Load initial state ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchQueueState();
        setCurrentPatient(data.currentPatient);
        setWaitingQueue(data.queue);
        setAvgTime(data.avgTime);
      } catch (err) {
        setError("Failed to connect to server. Please refresh.");
        console.error(err);
      }
    };
    load();
  }, []);

  // ── Socket subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch (err) {
      setError("Socket config error: " + (err as Error).message);
      return;
    }



    socket.on("queue_updated", (data: { queue: Patient[]; avgTime: number }) => {
      setWaitingQueue(data.queue);
      if (data.avgTime !== undefined) setAvgTime(data.avgTime);
    });

    socket.on(
      "current_token_changed",
      (data: { currentPatient: Patient | null; queue: Patient[]; avgTime: number }) => {
        setCurrentPatient(data.currentPatient);
        setWaitingQueue(data.queue);
        if (data.avgTime !== undefined) setAvgTime(data.avgTime);
      }
    );

    socket.on("patient_added", () => {
      fetchQueueState()
        .then((full) => {
          setWaitingQueue(full.queue);
          setCurrentPatient(full.currentPatient);
          setAvgTime(full.avgTime);
        })
        .catch(() => {});
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("queue_updated");
      socket.off("current_token_changed");
      socket.off("patient_added");
    };
  }, []);

  // ── Token lookup ────────────────────────────────────────────────────────
  const handleTokenSubmit = useCallback(() => {
    const val = parseInt(tokenInput.trim(), 10);
    if (isNaN(val) || val < 1) {
      setTokenError("Please enter a valid token number");
      return;
    }
    setMyToken(val);
    setTokenError("");
  }, [tokenInput]);

  const handleClearToken = () => {
    setMyToken(null);
    setTokenInput("");
  };

  // ── Derived values ──────────────────────────────────────────────────────
  const myPosition = myToken !== null
    ? waitingQueue.findIndex((p) => p.tokenNumber === myToken)
    : -1;

  // If our token is being served (in-progress)
  const isBeingServed =
    myToken !== null &&
    currentPatient !== null &&
    currentPatient.tokenNumber === myToken;

  // People ahead = position in waiting queue (if found), else -1 (not in queue)
  const peopleAhead = myPosition >= 0 ? myPosition : 0;
  const isInQueue = myPosition >= 0;
  const isInactive = myToken !== null && !isInQueue && !isBeingServed;

  return (
    <div className="min-h-screen mesh-bg">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-brand-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-slate-500 text-xs hover:text-slate-300 transition-colors mb-1 inline-block">
              ← Home
            </Link>
            <h1 className="text-2xl font-bold text-gradient-emerald">Waiting Room</h1>
            <p className="text-slate-500 text-xs mt-0.5">Queue Cure &apos;26 — Live Queue Status</p>
          </div>

        </header>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-300 animate-slide-up">
            {error}
          </div>
        )}

        {/* ── Current Token Banner ──────────────────────────────────────── */}
        <div className="card mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Now Serving
          </p>
          {currentPatient ? (
            <div className="flex flex-col items-center gap-3">
              <TokenBadge
                token={currentPatient.tokenNumber}
                size="xl"
                variant="current"
                label="Token"
              />
              <div>
                <p className="text-lg font-semibold text-slate-100">{currentPatient.name}</p>
                <p className="text-xs text-emerald-400/70 mt-0.5 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  In consultation
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-slate-600">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm">No patient being served yet</p>
            </div>
          )}
        </div>

        {/* ── Token entry ───────────────────────────────────────────────── */}
        {myToken === null ? (
          <div className="card mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Enter Your Token Number
            </h2>
            <div className="flex gap-3">
              <input
                id="input-my-token"
                type="number"
                min={1}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTokenSubmit()}
                placeholder="e.g. 7"
                className="input-field flex-1"
                aria-label="Your token number"
              />
              <button
                id="btn-find-token"
                onClick={handleTokenSubmit}
                className="btn-primary whitespace-nowrap"
                disabled={!tokenInput.trim()}
              >
                Track My Token
              </button>
            </div>
            {tokenError && (
              <p className="text-xs text-red-400 mt-2">{tokenError}</p>
            )}
            <p className="text-xs text-slate-600 mt-2">
              Enter the token number shown on your slip to see your position
            </p>
          </div>
        ) : (
          <div className="mb-6">
            {/* My token display */}
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Your Token
                </h2>
                <button
                  id="btn-change-token"
                  onClick={handleClearToken}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Change token
                </button>
              </div>

              <div className="flex items-center gap-6">
                <TokenBadge
                  token={myToken}
                  size="lg"
                  variant="yours"
                  label="Your Token"
                />
                <div className="flex-1">
                  {isBeingServed ? (
                    <div>
                      <p className="text-emerald-300 font-bold text-lg">🎉 Your turn!</p>
                      <p className="text-slate-400 text-sm mt-1">Please proceed to the doctor&apos;s room</p>
                    </div>
                  ) : isInactive ? (
                    <div>
                      <p className="text-slate-400 font-semibold">Token not in queue</p>
                      <p className="text-slate-600 text-sm mt-1">
                        This token may have already been called or doesn&apos;t exist yet.
                      </p>
                    </div>
                  ) : isInQueue ? (
                    <div>
                      <p className="text-slate-300 font-semibold">You&apos;re in queue</p>
                      <p className="text-slate-500 text-sm mt-1">
                        Position <span className="text-brand-300 font-bold">#{myPosition + 1}</span> in waiting list
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Wait time banner */}
            {(isInQueue || isBeingServed) && (
              <WaitTimeBanner
                peopleAhead={isBeingServed ? 0 : peopleAhead}
                avgTime={avgTime}
                yourToken={myToken}
                currentToken={currentPatient?.tokenNumber ?? null}
              />
            )}

            {isInactive && (
              <div className="card text-center py-8 text-slate-500">
                <svg className="w-10 h-10 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">Token #{String(myToken).padStart(2, "0")} not found in queue</p>
                <p className="text-xs text-slate-600 mt-1">It may have already been served or hasn&apos;t been added yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── Waiting queue overview ──────────────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Current Queue
            </h2>
            <span className="text-xs text-slate-500 glass rounded-full px-3 py-1">
              {waitingQueue.length} waiting
            </span>
          </div>

          {waitingQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
              <svg className="w-10 h-10 mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">Queue is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waitingQueue.map((patient, idx) => {
                const isMe = myToken !== null && patient.tokenNumber === myToken;
                return (
                  <div
                    key={patient._id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isMe
                        ? "bg-brand-600/20 border border-brand-500/30"
                        : "bg-white/4 hover:bg-white/6"
                    }`}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-mono font-bold text-brand-300 text-sm w-10">
                      #{String(patient.tokenNumber).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-slate-300 font-medium">{patient.name}</span>
                    {isMe && (
                      <span className="text-xs text-brand-400 font-semibold">← You</span>
                    )}
                    <span className="text-xs text-slate-600 hidden sm:block">
                      ~{(idx) * avgTime}m wait
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-8">
          Updates in real-time via Socket.IO
        </p>
      </div>
    </div>
  );
}
