/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function formatError(error: unknown, prefix = ""): string {
  let s = ""
  if (error instanceof Error) {
    s = error.message
  } else if (typeof error === "string") {
    s = error
  } else if (error && typeof error === "object") {
    s =
      "message" in error
        ? String(error.message)
        : JSON.stringify(error, null, 2)
  } else s = String(error)
  return prefix ? `[${prefix}] ${s}` : s
}

export function formatMessage(...args: any[]): string {
  return args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(" ")
}

export type ResultDTO<T> =
  | { ok: true; data: T }
  | { ok: false; code: number; message: string }
