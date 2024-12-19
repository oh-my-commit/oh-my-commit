import type { AppManager } from "@/app.manager";
import type { DiffResult } from "simple-git";
declare const AcManager_base: any;
/**
 * todo: use AcService
 */
export declare class AcManager extends AcManager_base {
    private providers;
    constructor(app: AppManager);
    get models(): any[];
    get modelId(): any;
    get model(): any;
    get provider(): any;
    selectModel(modelId: string): Promise<boolean>;
    generateCommit(diff: DiffResult): Promise<any>;
}
export {};
