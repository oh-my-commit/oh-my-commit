import { BaseGenerateCommitProvider } from "@oh-my-commit/shared/common";
import { GenerateCommitInput, Model } from "@oh-my-commit/shared/common";
import { BaseLogger } from "@oh-my-commit/shared/common";
import { ResultAsync } from "neverthrow";
declare class OmcStandardModel implements Model {
    id: string;
    name: string;
    description: string;
    providerId: string;
    aiProviderId: string;
    metrics: {
        accuracy: number;
        speed: number;
        cost: number;
    };
}
export declare class OmcProvider extends BaseGenerateCommitProvider {
    logger: BaseLogger;
    id: string;
    displayName: string;
    description: string;
    models: OmcStandardModel[];
    private anthropic;
    constructor(logger?: BaseLogger, _apiKey?: string, proxyUrl?: string);
    generateCommit(input: GenerateCommitInput): ResultAsync<{
        title: string;
        body: string;
        meta: {
            type?: string;
            scope?: string;
            breaking?: boolean;
            issues?: string[];
        };
    }, any>;
    private callApi;
    private handleApiResult;
}
export {};
