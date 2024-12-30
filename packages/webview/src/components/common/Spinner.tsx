/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

type SpinnerProps = React.HTMLAttributes<HTMLDivElement>

export function Spinner({ className = "", ...props }: SpinnerProps) {
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} {...props} />
  )
}
