const BASE_URL = import.meta.env.VITE_API_URL;

export const TOKEN_KEY = "auth_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) clearToken();
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function requestForm<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
  postForm: <T>(path: string, body: Record<string, string>) => requestForm<T>(path, body),
};
