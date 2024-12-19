// 错误格式化
export const formatError = (e: unknown): string => {
  if (e instanceof Error) return e.message
  return String(e)
}
