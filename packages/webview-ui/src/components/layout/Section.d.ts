import type { PropsWithChildren } from "react";
interface SectionProps extends PropsWithChildren {
    className?: string;
    title?: string;
    actions?: React.ReactNode;
}
interface SectionContentProps extends PropsWithChildren {
    className?: string;
}
interface SectionFooterProps extends PropsWithChildren {
    className?: string;
}
export declare const Section: {
    ({ children, className, title, actions }: SectionProps): JSX.Element;
    Content: ({ children, className }: SectionContentProps) => JSX.Element;
    Footer: ({ children, className }: SectionFooterProps) => JSX.Element | null;
};
export {};
