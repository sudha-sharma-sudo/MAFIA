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
exports.MAFIAAgent = void 0;
const uuid_1 = require("uuid");
const KnowledgeGraph_1 = require("./KnowledgeGraph");
const SkillRegistry_1 = require("./SkillRegistry");
class MAFIAAgent {
    constructor(config = {}) {
        this.complexityScore = 0;
        this.uiEventHandlers = new Map();
        this.knowledgeBase = new KnowledgeGraph_1.KnowledgeGraph();
        this.skillSet = new SkillRegistry_1.EnhancedSkillRegistry();
        this.activeTasks = new Map();
        this.taskQueue = [];
    }
    on(event, handler) {
        this.uiEventHandlers.set(event, handler);
    }
    emit(event, data) {
        var _a;
        (_a = this.uiEventHandlers.get(event)) === null || _a === void 0 ? void 0 : _a(data);
    }
    calculateComplexity(task) {
        const baseComplexity = 1;
        const params = task.parameters;
        const paramComplexity = Object.keys(params).length * 0.5;
        const skillComplexity = 1;
        return Math.min(100, baseComplexity + paramComplexity + skillComplexity);
    }
    classifyError(error) {
        if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            return { severity: 3, type: 'TIMEOUT' };
        }
        if (error.message.includes('validation') || error.message.includes('VALIDATION') || error.message.includes('Validation')) {
            return { severity: 2, type: 'VALIDATION' };
        }
        if (error.message.includes('ENOENT')) {
            return { severity: 2, type: 'FILE_NOT_FOUND' };
        }
        return { severity: 1, type: 'UNKNOWN' };
    }
    logError(error, context) {
        const classification = this.classifyError(error);
        const decision = {
            timestamp: new Date(),
            action: 'ERROR_LOG',
            rationale: `${context}: ${error.message} [Severity: ${classification.severity}, Type: ${classification.type}]`,
            outcome: 'failure',
            taskId: (0, uuid_1.v4)(),
            version: 1
        };
        this.knowledgeBase.recordDecision(decision);
        this.emit('error_occurred', {
            message: error.message,
            severity: classification.severity,
            context
        });
    }
    getDynamicPrompts(task) {
        return [
            {
                id: 'base-prompt',
                content: `Execute task: ${task.type}`,
                priority: 1
            },
            {
                id: 'complexity-prompt',
                content: `Current complexity score: ${this.complexityScore}`,
                priority: 2
            }
        ];
    }
    executeTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskId = (0, uuid_1.v4)();
            const startTime = Date.now();
            this.activeTasks.set(taskId, task);
            this.complexityScore = this.calculateComplexity(task);
            this.emit('task_start', { taskId, complexity: this.complexityScore });
            try {
                const similarFailures = this.knowledgeBase.findSimilarDecisions(task.type)
                    .filter(d => d.outcome === 'failure');
                if (similarFailures.length > 0) {
                    this.logError(new Error(`Similar tasks previously failed: ${similarFailures.map(f => f.rationale).join(', ')}`), 'executeTask');
                    return {
                        success: false,
                        output: `Similar tasks previously failed`,
                        metrics: {
                            duration: Date.now() - startTime,
                            errorCount: 1
                        }
                    };
                }
                const result = yield this.processTask(task);
                return result;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorObj = error instanceof Error ? error : new Error(errorMessage);
                this.logError(errorObj, 'executeTask');
                const errorClassification = this.classifyError(errorObj);
                // For timeout errors (severity 3), always throw to reject promise
                if (errorClassification.type === 'TIMEOUT') {
                    throw errorObj; // Force promise rejection for timeouts
                }
                // For other high severity errors (>=2), throw if task is critical
                if (errorClassification.severity >= 2 && task.critical) {
                    throw errorObj;
                }
                return {
                    success: false,
                    output: errorMessage,
                    metrics: {
                        duration: Date.now() - startTime,
                        errorCount: 1,
                        errorType: this.classifyError(errorObj).type
                    }
                };
            }
            finally {
                this.activeTasks.delete(taskId);
            }
        });
    }
    processTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            try {
                const context = {
                    requestId: task.id,
                    agentId: 'mafia-agent',
                    knowledgeGraph: this.knowledgeBase,
                    dynamicPrompts: this.getDynamicPrompts(task),
                    complexityScore: this.complexityScore,
                    logger: {
                        info: (msg) => {
                            console.log(`[INFO] ${msg}`);
                            this.emit('log_info', msg);
                        },
                        error: (msg) => {
                            console.error(`[ERROR] ${msg}`);
                            this.emit('log_error', msg);
                        }
                    }
                };
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('API_TIMEOUT')), 5000));
                const result = yield Promise.race([
                    this.skillSet.executeSkill(task.type, task.parameters, context),
                    timeoutPromise
                ]);
                if (this.complexityScore > 3) {
                    this.emit('deep_mode_activated', {
                        taskId: task.id,
                        complexity: this.complexityScore
                    });
                }
                if (this.knowledgeBase.linkDecisionToCode) {
                    const params = task.parameters;
                    if (typeof params.filePath === 'string') {
                        this.knowledgeBase.linkDecisionToCode(task.id, params.filePath);
                    }
                }
                const metrics = Object.assign({ duration: Date.now() - startTime }, (result.metrics || {}));
                return {
                    success: true,
                    output: result.output,
                    metrics
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorObj = error instanceof Error ? error : new Error(errorMessage);
                const metrics = {
                    duration: Date.now() - startTime,
                    errorCount: 1,
                    errorType: this.classifyError(errorObj).type
                };
                // For timeout errors, rethrow to maintain consistent behavior
                if (this.classifyError(errorObj).type === 'TIMEOUT') {
                    throw errorObj;
                }
                return {
                    success: false,
                    output: errorMessage,
                    metrics
                };
            }
        });
    }
    queueTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            this.taskQueue.push(task);
            this.taskQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        });
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.taskQueue.length > 0) {
                const task = this.taskQueue.shift();
                yield this.executeTask(task);
            }
        });
    }
}
exports.MAFIAAgent = MAFIAAgent;
//# sourceMappingURL=AgentSystem.js.map