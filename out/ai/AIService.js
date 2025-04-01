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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const vscode = process.env.NODE_ENV === 'test'
    ? global.vscode
    : require('vscode');
const uuid_1 = require("uuid");
const AgentSystem_1 = require("../core/AgentSystem");
class AIService {
    constructor(config = {}) {
        this.cache = new Map();
        this.apiKey = config.apiKey || '';
        this.agent = new AgentSystem_1.MAFIAAgent({
            knowledgeGraph: Object.assign({ persistToDisk: true, maxHistoryItems: 1000 }, config.knowledgeGraph)
        });
    }
    executeSkill(skillName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${skillName}:${JSON.stringify(params)}`;
            const task = {
                id: (0, uuid_1.v4)(),
                type: skillName,
                parameters: params,
                priority: 1
            };
            try {
                if (this.cache.has(cacheKey)) {
                    return {
                        output: this.cache.get(cacheKey),
                        success: true,
                        metrics: {
                            duration: 0,
                            cacheHit: true
                        }
                    };
                }
                const startTime = Date.now();
                const result = yield this.agent.executeTask(task);
                const duration = Date.now() - startTime;
                if (result.success && result.output) {
                    this.cache.set(cacheKey, result.output);
                }
                return Object.assign(Object.assign({}, result), { metrics: Object.assign(Object.assign({}, result.metrics), { duration }) });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Skill execution failed: ${error instanceof Error ? error.message : String(error)}`);
                throw error;
            }
        });
    }
    analyzeCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.executeSkill('code-analysis', { code });
            if (typeof result.output !== 'string') {
                throw new Error('Analysis returned non-string output');
            }
            return result.output;
        });
    }
    refactorCode(code, refactorType) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.executeSkill('code-refactor', {
                code,
                refactorType: refactorType || 'optimize'
            });
            if (typeof result.output !== 'string') {
                throw new Error('Refactor returned non-string output');
            }
            return result.output;
        });
    }
    processQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.analyzeCode(query);
        });
    }
    generateDocumentation(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.executeSkill('documentation', { code });
            if (typeof result.output !== 'string') {
                throw new Error('Documentation generation returned non-string output');
            }
            return result.output;
        });
    }
    clearCache() {
        this.cache.clear();
        if ('clearCache' in this.agent.skillSet) {
            this.agent.skillSet.clearCache();
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=AIService.js.map