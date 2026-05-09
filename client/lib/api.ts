const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RequestOptions {
  body?: unknown;
  token?: string;
}

const request = async <T>(
  method: string,
  path: string,
  { body, token }: RequestOptions = {},
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(message.error || 'Request failed');
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
};

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
