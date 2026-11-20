export type Voice={id:string;displayName:string;language:string;gender?:string|null};
export type Generation={id:string;status:'QUEUED'|'RUNNING'|'SUCCEEDED'|'FAILED'|'CANCELLED';text:string;textCharacters:number;voiceId:string;audioDuration?:number|null;createdAt:string;errorMessage?:string|null};
export type Me={id:string;email?:string|null;displayName?:string|null;role:string};
export type Usage={balance:number;reserved:number;usedThisMonth:number;planName?:string|null};
export type Plan={id:string;code:string;name:string;monthlyCredits:number;maxCharacters:number;maxConcurrentJobs:number};
export type CreditPackage={id:string;code:string;name:string;description?:string|null;priceVnd:number;credits:number};
export type PaymentOrder={id:string;orderCode:string;amountVnd:number;credits:number;currency:'VND';provider:'VNPAY';status:'PENDING'|'PAID'|'FAILED'|'EXPIRED'|'CANCELLED';expiresAt:string;paidAt?:string|null;createdAt:string;updatedAt:string;responseCode?:string|null;providerTransactionNo?:string|null;bankCode?:string|null;bankTranNo?:string|null};
export type CreatePaymentOrderResponse={order:PaymentOrder;paymentUrl:string|null;duplicate:boolean};
const configuredApiBaseUrl=import.meta.env.VITE_API_BASE_URL?.trim();
if(!configuredApiBaseUrl&&!import.meta.env.DEV)throw new Error('VITE_API_BASE_URL must be configured outside development.');
const API_BASE_URL=(configuredApiBaseUrl||'http://localhost:3058/api/v1').replace(/\/+$/,'');
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const REQUEST_TIMEOUT_MS = 30_000;

function normalizeApiError(status: number, message?: string | string[]): ApiError {
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
  return new ApiError(normalizedMessage, status);
}

function normalizeTransportError(error: unknown, signal: AbortSignal, callerSignal?: AbortSignal | null): never {
  if (callerSignal?.aborted) throw error;
  if (
    (error instanceof DOMException && error.name === 'TimeoutError')
    || (signal.aborted && signal.reason instanceof DOMException && signal.reason.name === 'TimeoutError')
  ) {
    throw new ApiError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.', 408);
  }
  if (error instanceof DOMException && error.name === 'AbortError') throw error;
  throw new ApiError('Không thể kết nối máy chủ. Hãy kiểm tra kết nối mạng.', 0);
}

async function requestResponse(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<{ response: Response; signal: AbortSignal }> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
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
        | { message?: string | string[] }
        | null;
      throw normalizeApiError(response.status, body?.message);
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
): Promise<T> {
  const { response } = await requestResponse(path, accessToken, init);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function fetchAudio(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<string> {
  const { response, signal } = await requestResponse(path, token, { ...init, method: 'GET' });
  let audioBlob: Blob;
  try {
    audioBlob = await response.blob();
  } catch (error) {
    normalizeTransportError(error, signal, init.signal);
  }
  return URL.createObjectURL(audioBlob);
}
