"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
class AIService {
    constructor(config) {
        this.baseUrl = 'https://api.blackbox.ai/v1';
        this.cache = new Map();
        this.apiKey = config.apiKey;
    }
    callAI(endpoint, payload, retries = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${endpoint}:${JSON.stringify(payload)}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            try {
                const response = yield axios_1.default.post(`${this.baseUrl}/${endpoint}`, payload, {
                    headers: { Authorization: `Bearer ${this.apiKey}` },
                    timeout: 10000
                });
                const result = response.data.result;
                this.cache.set(cacheKey, result);
                return result;
            }
            catch (error) {
                if (retries > 0) {
                    return this.callAI(endpoint, payload, retries - 1);
                }
                throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    processQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callAI('query', { text: query });
        });
    }
    analyzeCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callAI('analyze', { code });
        });
    }
    generateDocumentation(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.callAI('docs', { code });
            return `# Documentation\n\n${docs}\n\n## Parameters\n\n## Examples\n`;
        });
    }
}
exports.AIService = AIService;
//# sourceMappingURL=AIService.js.map