import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://127.0.0.1:5000';

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, '');

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  statusCode?: number;
};

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(`Could not reach the backend at ${API_BASE_URL}. Check the API URL, server, and network.`);
  }

  const responseText = await response.text();
  let payload: ApiEnvelope<T> | T | null = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText) as ApiEnvelope<T> | T;
    } catch {
      if (response.ok) throw new ApiError('The backend returned an invalid response.', response.status);
    }
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload && typeof payload.message === 'string'
      ? payload.message
      : `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  if (payload === null) {
    throw new ApiError('The backend returned an empty response.', response.status);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    if (payload.data === undefined) {
      throw new ApiError('The backend response is missing its data field.', response.status);
    }
    return payload.data as T;
  }

  return payload as T;
}
