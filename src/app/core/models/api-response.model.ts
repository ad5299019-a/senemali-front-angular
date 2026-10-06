/** Enveloppe standard renvoyée par GlobalResponseAdvice côté backend. */
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Corps d'erreur renvoyé par GlobalExceptionHandler (validation 400, etc.) */
export interface ApiErrorBody {
  success?: boolean;
  status?: number;
  message?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}
