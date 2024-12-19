export type ResultDTO<T> =
  | { ok: true; data: T }
  | { ok: false; code: number; message: string };
