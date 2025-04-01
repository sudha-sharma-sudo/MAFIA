import * as vscode from 'vscode';
import axios from 'axios';

export class AIService {
    private apiKey: string;
    private baseUrl = 'https://api.blackbox.ai/v1';
    private cache = new Map<string, string>();

    constructor(config: { apiKey: string }) {
        this.apiKey = config.apiKey;
    }

    private async callAI(endpoint: string, payload: any, retries = 3): Promise<string> {
        const cacheKey = `${endpoint}:${JSON.stringify(payload)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/${endpoint}`, payload, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                timeout: 10000
            });
            const result = response.data.result;
            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            if (retries > 0) {
                return this.callAI(endpoint, payload, retries - 1);
            }
            throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async processQuery(query: string): Promise<string> {
        return this.callAI('query', { text: query });
    }

    public async analyzeCode(code: string): Promise<string> {
        return this.callAI('analyze', { code });
    }

    public async generateDocumentation(code: string): Promise<string> {
        const docs = await this.callAI('docs', { code });
        return `# Documentation\n\n${docs}\n\n## Parameters\n\n## Examples\n`;
    }
}