const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FetchOptions = RequestInit & { token?: string };

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...init } = options;
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw { status: res.status, detail: error.detail ?? "Unknown error" };
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
