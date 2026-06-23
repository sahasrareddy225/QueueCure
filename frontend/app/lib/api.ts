export interface Patient {
  _id: string;
  name: string;
  tokenNumber: number;
  status: "waiting" | "in-progress" | "completed";
  createdAt: string;
}

export interface QueueState {
  currentPatient: Patient | null;
  queue: Patient[];
  allPatients: Patient[];
  avgTime: number;
}

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Cannot make API calls."
    );
  }
  return url;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── Patients ──────────────────────────────────────────────────────────────────

export const fetchAllPatients = async (): Promise<{ patients: Patient[] }> => {
  const res = await fetch(`${getBaseUrl()}/api/patients`, {
    cache: "no-store",
  });
  return handleResponse(res);
};

export const addPatient = async (name: string): Promise<{ patient: Patient }> => {
  const res = await fetch(`${getBaseUrl()}/api/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
};

// ── Queue ─────────────────────────────────────────────────────────────────────

export const fetchQueueState = async (): Promise<QueueState> => {
  const res = await fetch(`${getBaseUrl()}/api/queue/current`, {
    cache: "no-store",
  });
  return handleResponse(res);
};

export const callNextPatient = async (): Promise<{ currentPatient: Patient | null; message?: string }> => {
  const res = await fetch(`${getBaseUrl()}/api/queue/call-next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
};

export const updateAvgTime = async (avgTime: number): Promise<{ avgTime: number }> => {
  const res = await fetch(`${getBaseUrl()}/api/queue/avg-time`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avgTime }),
  });
  return handleResponse(res);
};
