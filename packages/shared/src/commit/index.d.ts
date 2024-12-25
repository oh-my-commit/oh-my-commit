interface AICommitOptions {
    summary: string;
    changes: string;
    type: 'changeset' | 'version';
}
export declare function getAICommitMessage({ summary, changes, type, }: AICommitOptions): Promise<string>;
export {};
//# sourceMappingURL=index.d.ts.map