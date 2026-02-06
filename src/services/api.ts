const BASE_URL = import.meta.env.VITE_MODAL_BASE_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────

export interface UploadResponse {
  contacts_created: number;
  contacts_skipped: number;
  job_id: string;
  message: string;
}

export interface JobStatus {
  job_id: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  total_contacts: number;
  processed_count: number;
  failed_count: number;
}

export interface DraftItem {
  contact_id: string;
  full_name: string;
  raw_role: string;
  company_name: string;
  linkedin_url: string;
  draft_message: string;
  strategy_tag: string;
  research: {
    news_summary: string;
    pain_points: string;
    source_url: string;
  };
}

export interface DraftsResponse {
  drafts: DraftItem[];
  total: number;
  has_more: boolean;
}

export interface SendResponse {
  outreach_id: string;
  feedback_due_at: string;
}

export interface FeedbackItem {
  outreach_id: string;
  full_name: string;
  company_name: string;
  strategy_tag: string;
  sent_at: string;
  message_preview: string;
}

export interface FeedbackQueueResponse {
  pending: FeedbackItem[];
}

export interface DashboardResponse {
  total_sent: number;
  total_completed: number;
  total_replied: number;
  global_reply_rate: number;
  by_strategy: {
    strategy_tag: string;
    sent: number;
    replied: number;
    reply_rate: number;
  }[];
}

// ─── API Methods ─────────────────────────────────────────────

export function uploadCSV(file: File, userId: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("user_id", userId);
  return request("/ingest/upload", { method: "POST", body: form });
}

export function getJobStatus(jobId: string, userId: string): Promise<JobStatus> {
  return request(`/ingest/status/${jobId}?user_id=${encodeURIComponent(userId)}`);
}

export function getDrafts(
  userId: string,
  limit = 20,
  offset = 0
): Promise<DraftsResponse> {
  return request(
    `/feed/drafts?user_id=${encodeURIComponent(userId)}&limit=${limit}&offset=${offset}`
  );
}

export function sendOutreach(
  contactId: string,
  messageBody: string,
  strategyTag: string
): Promise<SendResponse> {
  return request("/action/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact_id: contactId,
      message_body: messageBody,
      strategy_tag: strategyTag,
    }),
  });
}

export function getFeedbackQueue(userId: string): Promise<FeedbackQueueResponse> {
  return request(`/feedback/queue?user_id=${encodeURIComponent(userId)}`);
}

export function recordSwipe(
  outreachId: string,
  outcome: "REPLIED" | "GHOSTED" | "BOUNCED"
): Promise<{ ok: boolean }> {
  return request("/feedback/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outreach_id: outreachId, outcome }),
  });
}

export function getDashboard(userId: string): Promise<DashboardResponse> {
  return request(`/analytics/dashboard?user_id=${encodeURIComponent(userId)}`);
}
