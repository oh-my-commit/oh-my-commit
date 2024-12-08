import { PropsWithChildren } from "react";

interface SectionProps extends PropsWithChildren {
  className?: string;
}

export const Section = ({ children, className = "" }: SectionProps) => {
  return (
    <section className={`flex flex-col h-full ${className}`}>
      {children}
    </section>
  );
};
