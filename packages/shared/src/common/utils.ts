/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
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

/**
 * Simple implementation of outdent without caching
 * @see: https://github.com/oh-my-commit/oh-my-commit/issues/5
 */
export function outdent(strings: TemplateStringsArray, ...values: any[]) {
  const indent =
    strings[0]?.match(/(?:\r\n|\r|\n)([ \t]*)(?:[^ \t\r\n]|$)/)?.[1]?.length ||
    0
  const reMatchIndent = new RegExp(`(\\r\\n|\\r|\\n).{0,${indent}}`, "g")

  const outdentedStrings = strings.map((str) =>
    str.replace(reMatchIndent, "$1")
  )
  let result = ""
  for (let i = 0; i < outdentedStrings.length; i++) {
    result += outdentedStrings[i]
    if (i < values.length) {
      result += values[i]
    }
  }
  return result
}
