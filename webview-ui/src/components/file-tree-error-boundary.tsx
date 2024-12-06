import React from "react";

export class FileTreeErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(_: Error) {
        return {hasError: true};
    }

    render() {
        if (this.state.hasError) {
            return <div className="error-message">Error loading file tree</div>;
        }

        return this.props.children;
    }
}