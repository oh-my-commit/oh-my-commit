import React from "react"

type SpinnerProps = React.HTMLAttributes<HTMLDivElement>

export function Spinner({ className = "", ...props }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      {...props}
    />
  )
}
