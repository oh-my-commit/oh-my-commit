// 错误格式化

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }
  return String(error)
}

export function formatMessage(...args: any[]): string {
  return args
    .map(arg => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ")
}

export type ResultDTO<T> = { ok: true; data: T } | { ok: false; code: number; message: string }
