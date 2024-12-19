"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcManager = void 0;
const mixins_1 = require("@/types/mixins");
const open_preference_1 = require("@/utils/open-preference");
const _shared_1 = require("@shared");
const vscode = __importStar(require("vscode"));
/**
 * todo: use AcService
 */
class AcManager extends (0, mixins_1.Loggable)(class {
}) {
    providers = [];
    constructor(app) {
        super();
    }
    get models() {
        return this.providers.flatMap(p => p.models);
    }
    get modelId() {
        return this.config.get(_shared_1.SETTING_MODEL_ID);
    }
    get model() {
        return this.models.find(model => model.id === this.modelId);
    }
    get provider() {
        return this.providers.find(p => p.models.some(model => model.id === this.modelId));
    }
    async selectModel(modelId) {
        const model = this.models.find(s => s.id === modelId);
        if (!model) {
            this.logger.error(`Model ${modelId} not found`);
            return false;
        }
        this.config.update(_shared_1.SETTING_MODEL_ID, modelId, true);
        const providerId = model.providerId;
        if (_shared_1.presetAiProviders.includes(providerId)) {
            const configureNow = "Configure Now";
            const configureLater = "Configure Later";
            const response = await vscode.window.showErrorMessage(`使用该模型需要先填写目标 ${providerId.toUpperCase()}_API_KEY`, configureNow, configureLater);
            if (response === configureNow) {
                await (0, open_preference_1.openPreferences)("oh-my-commit.apiKeys");
            }
        }
        return true;
    }
    async generateCommit(diff) {
        const model = this.model;
        this.logger.info("[AcManager] Generating commit using model: ", model);
        if (!model)
            throw new Error("No model selected");
        const provider = this.provider;
        this.logger.info("[AcManager] Generating commit using provider: ", provider);
        if (!provider)
            throw new Error(`Provider ${this.model.providerId} not found`);
        const options = {
            lang: this.config.get("ohMyCommit.git.commitLanguage") ?? vscode.env.language,
        };
        this.logger.info("options: ", options);
        const input = {
            diff,
            model: this.model,
            options,
        };
        return await this.provider.generateCommit(input);
    }
}
exports.AcManager = AcManager;
