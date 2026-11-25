export type Voice = {
  id: string;
  displayName: string;
  language: string;
  gender?: string | null;
  /** TTS group the voice belongs to (1 or 2). */
  group?: number;
  /** Credit multiplier per character: 1 for standard voices, higher for VIP voices. */
  creditsPerCharacter?: number;
};

export type Generation = {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  text: string;
  textCharacters: number;
  voiceId: string;
  audioDuration?: number | null;
  createdAt: string;
  errorMessage?: string | null;
};

export type Me = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  role: string;
};

/** Weekly free credit allowance; the week starts Monday 00:00 Vietnam time. */
export type FreeTierUsage = {
  weeklyCredits: number;
  usedThisWeek: number;
  remainingThisWeek: number;
  weekStartsAt: string;
  resetsAt: string;
};

export type Usage = {
  balance: number;
  reserved: number;
  usedThisMonth: number;
  planName?: string | null;
  freeTier?: FreeTierUsage;
};

export type FreeTierSetting = {
  weeklyCredits: number;
  updatedAt: string;
  updatedBy: string | null;
};

export type Plan = {
  id: string;
  code: string;
  name: string;
  monthlyCredits: number;
  maxCharacters: number;
  maxConcurrentJobs: number;
};

export type CreditPackage = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  priceVnd: number;
  credits: number;
};

export type PaymentOrder = {
  id: string;
  orderCode: string;
  amountVnd: number;
  credits: number;
  currency: 'VND';
  provider: 'VNPAY';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  responseCode?: string | null;
  providerTransactionNo?: string | null;
  bankCode?: string | null;
  bankTranNo?: string | null;
};

export type CreatePaymentOrderResponse = {
  order: PaymentOrder;
  paymentUrl: string | null;
  duplicate: boolean;
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!configuredApiBaseUrl && !import.meta.env.DEV) {
  throw new Error('VITE_API_BASE_URL must be configured outside development.');
}

export const API_BASE_URL = (
  configuredApiBaseUrl || 'http://localhost:3058/api/v1'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly details?: { problems?: string[]; missingAssets?: string[] }) {
    super(message);
    this.name = 'ApiError';
  }
}

const REQUEST_TIMEOUT_MS = 30_000;

function normalizeApiError(
  status: number,
  message?: string | string[],
  details?: { problems?: string[]; missingAssets?: string[] },
): ApiError {
  const fallback = status === 401
    ? 'Phiên đăng nhập đã hết hạn.'
    : status === 402
      ? 'Tài khoản không đủ credit để tạo giọng nói.'
      : status === 429
        ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'
        : 'Máy chủ chưa thể xử lý yêu cầu.';

  const normalizedMessage = status === 402
    ? fallback
    : Array.isArray(message)
      ? message.join(', ')
      : message || fallback;

  return new ApiError(normalizedMessage, status, details);
}

function normalizeTransportError(
  error: unknown,
  signal: AbortSignal,
  callerSignal?: AbortSignal | null,
): never {
  if (callerSignal?.aborted) throw error;

  if (
    (error instanceof DOMException && error.name === 'TimeoutError')
    || (
      signal.aborted
      && signal.reason instanceof DOMException
      && signal.reason.name === 'TimeoutError'
    )
  ) {
    throw new ApiError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.', 408);
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    throw error;
  }

  throw new ApiError(
    'Không thể kết nối máy chủ. Hãy kiểm tra kết nối mạng.',
    0,
  );
}

async function requestResponse(
  path: string,
  accessToken: string,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<{ response: Response; signal: AbortSignal }> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(
      `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
      { ...init, headers, signal },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null) as
        | { message?: string | string[]; problems?: string[]; missingAssets?: string[] }
        | null;
      throw normalizeApiError(response.status, body?.message, body ? { problems: body.problems, missingAssets: body.missingAssets } : undefined);
    }

    return { response, signal };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    normalizeTransportError(error, signal, init.signal);
  }
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
  timeoutMs?: number,
): Promise<T> {
  const { response } = await requestResponse(path, accessToken, init, timeoutMs);

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export async function fetchAudio(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<string> {
  const { response, signal } = await requestResponse(
    path,
    token,
    { ...init, method: 'GET' },
  );

  let audioBlob: Blob;
  try {
    audioBlob = await response.blob();
  } catch (error) {
    normalizeTransportError(error, signal, init.signal);
  }

  return URL.createObjectURL(audioBlob);
}

/** Downloads a binary response (rendered video) with a caller-chosen timeout. */
export async function fetchBlob(path: string, token: string, init: RequestInit = {}, timeoutMs = 10 * 60_000): Promise<Blob> {
  const { response, signal } = await requestResponse(path, token, { ...init, method: 'GET' }, timeoutMs);
  try {
    return await response.blob();
  } catch (error) {
    normalizeTransportError(error, signal, init.signal);
  }
}
