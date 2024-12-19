import type { PropsWithChildren } from "react"

interface SectionProps extends PropsWithChildren {
  className?: string
  title?: string
  actions?: React.ReactNode
}

interface SectionHeaderProps extends PropsWithChildren {
  title?: string
  actions?: React.ReactNode
}

interface SectionContentProps extends PropsWithChildren {
  className?: string
}

interface SectionFooterProps extends PropsWithChildren {
  className?: string
}

const SectionHeader = ({ title, actions }: SectionHeaderProps) => {
  if (!title && !actions) return null
  return (
    <div className="section-header flex items-center justify-between">
      {title && (
        <h1 className="section-title text-base font-medium text-[var(--vscode-editor-foreground)]">
          {title}
        </h1>
      )}
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  )
}

const SectionContent = ({ children, className = "" }: SectionContentProps) => {
  return <div className={`section-content flex flex-col gap-2 ${className}`}>{children}</div>
}

const SectionFooter = ({ children, className = "" }: SectionFooterProps) => {
  if (!children) return null
  return (
    <div className={`section-footer flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}

export const Section = ({ children, className = "", title, actions }: SectionProps) => {
  return (
    <section
      className={`m-4 flex flex-col gap-4 ${className} bg-[var(--vscode-input-background)] p-3 rounded-sm border border-[var(--vscode-input-border)]`}
    >
      <SectionHeader title={title} actions={actions} />
      {children}
    </section>
  )
}

Section.Content = SectionContent
Section.Footer = SectionFooter
