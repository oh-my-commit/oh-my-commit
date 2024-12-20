// 错误格式化

export const formatError = (e: unknown): string => {
  if (e instanceof Error) return e.message
  return String(e)
}

export function formatMessage(...args: any[]): string {
  return args
    .map(arg => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ")
}

export type ResultDTO<T> = { ok: true; data: T } | { ok: false; code: number; message: string }
