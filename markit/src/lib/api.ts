const BASE_URL = import.meta.env.VITE_API_URL;

// Sent on every state-changing request. Cross-origin pages can't add it without
// a CORS preflight, which the API only allows for the frontend's own origin.
const CSRF_HEADERS = { "X-Requested-With": "markit" } as const;

/**
 * Error with the HTTP status (0 = network failure, e.g. CORS or server down).
 * Authentication lives in an HttpOnly cookie, so the frontend never sees or
 * stores the token; a 401 simply means "not signed in".
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: { ...CSRF_HEADERS, ...(init.headers as Record<string, string> | undefined) },
    });
  } catch {
    throw new ApiError(0, NETWORK_MESSAGE);
  }
}

async function errorFrom(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => ({}));
  const detail = typeof body.detail === "string" ? body.detail : undefined;
  return new ApiError(res.status, detail || "Something went wrong");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  const res = await send(path, {
    ...options,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
  });

  if (!res.ok) throw await errorFrom(res);
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function requestForm<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await send(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) throw await errorFrom(res);
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
  postForm: <T>(path: string, body: Record<string, string>) => requestForm<T>(path, body),
};
