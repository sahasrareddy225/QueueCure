import React from "react";

interface WaitTimeBannerProps {
  peopleAhead: number;
  avgTime: number;
  yourToken: number | null;
  currentToken: number | null;
}

export const WaitTimeBanner: React.FC<WaitTimeBannerProps> = ({
  peopleAhead,
  avgTime,
  yourToken,
  currentToken,
}) => {
  const waitMinutes = peopleAhead * avgTime;
  const isBeingCalled = yourToken !== null && currentToken === yourToken;
  const isNext = peopleAhead === 0 && !isBeingCalled;

  if (isBeingCalled) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 p-6 text-center animate-pulse-slow">
        <div className="absolute inset-0 bg-emerald-500/5 animate-ping rounded-2xl" />
        <div className="relative">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-2xl font-bold text-emerald-300">It&apos;s Your Turn!</p>
          <p className="text-sm text-emerald-400/80 mt-1">Please proceed to the consultation room</p>
        </div>
      </div>
    );
  }

  if (isNext) {
    return (
      <div className="rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 p-6 text-center">
        <div className="text-4xl mb-2">⚡</div>
        <p className="text-2xl font-bold text-amber-300">You&apos;re Next!</p>
        <p className="text-sm text-amber-400/80 mt-1">Please be ready — you&apos;re next in queue</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-brand-300">{peopleAhead}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Ahead of you</p>
        </div>
        <div className="border-x border-white/10">
          <p className="text-3xl font-bold text-slate-200">
            {waitMinutes < 60
              ? `${waitMinutes}m`
              : `${Math.floor(waitMinutes / 60)}h ${waitMinutes % 60}m`}
          </p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Est. Wait</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-400">{avgTime}m</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Per Patient</p>
        </div>
      </div>
    </div>
  );
};
