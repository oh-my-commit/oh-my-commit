import { AppManager } from "@/app.manager";
import { BaseGenerateCommitProvider } from "@oh-my-commit/shared";
import { DiffResult } from "simple-git";
declare const AcManager_base: any;
export declare class AcManager extends AcManager_base {
    private providers;
    constructor(app: AppManager);
    get models(): import("@oh-my-commit/shared", { with: { "resolution-mode": "require" } }).Model[];
    get modelId(): any;
    get model(): import("@oh-my-commit/shared", { with: { "resolution-mode": "require" } }).Model | undefined;
    get provider(): BaseGenerateCommitProvider | undefined;
    selectModel(modelId: string): Promise<boolean>;
    generateCommit(diff: DiffResult): Promise<import("neverthrow").Result<import("@oh-my-commit/shared", { with: { "resolution-mode": "require" } }).GenerateCommitResult, import("@oh-my-commit/shared", { with: { "resolution-mode": "require" } }).GenerateCommitError>>;
}
export {};
