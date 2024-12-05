import * as vscode from 'vscode';

export interface ApiConfig {
    provider: string;
    credentials: {
        [key: string]: string;
    };
    settings?: {
        [key: string]: any;
    };
}

export class ConfigManager {
    constructor(private context: vscode.ExtensionContext) {}

    public async getApiConfig(provider: string): Promise<ApiConfig | undefined> {
        const configs = await this.context.secrets.get('yaac.apiConfigs');
        if (!configs) {
            return undefined;
        }

        const parsedConfigs = JSON.parse(configs) as { [key: string]: ApiConfig };
        return parsedConfigs[provider];
    }

    public async setApiConfig(config: ApiConfig): Promise<void> {
        const configs = await this.context.secrets.get('yaac.apiConfigs');
        const parsedConfigs = configs ? JSON.parse(configs) : {};
        
        parsedConfigs[config.provider] = config;
        await this.context.secrets.store('yaac.apiConfigs', JSON.stringify(parsedConfigs));
    }

    public async removeApiConfig(provider: string): Promise<void> {
        const configs = await this.context.secrets.get('yaac.apiConfigs');
        if (!configs) {
            return;
        }

        const parsedConfigs = JSON.parse(configs);
        delete parsedConfigs[provider];
        await this.context.secrets.store('yaac.apiConfigs', JSON.stringify(parsedConfigs));
    }

    public async validateApiConfig(_config: ApiConfig): Promise<boolean> {
        // TODO: 实现 API 配置验证逻辑
        return true;
    }
}
