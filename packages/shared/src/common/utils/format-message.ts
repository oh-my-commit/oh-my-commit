export function formatMessage(...args: any[]): string {
  return args
    .map(arg => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ")
}
