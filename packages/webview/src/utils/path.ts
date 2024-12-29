/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const basename = (path: string): string => {
  const parts = path.split("/")
  return parts[parts.length - 1]!
}
