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

export function formatMessage(message: string, ...args: any[]): string {
  return args.length ? `${message} ${args.join(" ")}` : message
}

export type ResultDTO<T> = { ok: true; data: T } | { ok: false; code: number; message: string }
