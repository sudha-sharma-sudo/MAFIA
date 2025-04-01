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
        this.knowledgeBase = new KnowledgeGraph_1.KnowledgeGraph();
        this.skillSet = new SkillRegistry_1.EnhancedSkillRegistry();
        this.activeTasks = new Map();
        this.taskQueue = [];
    }
    executeTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskId = (0, uuid_1.v4)();
            const startTime = Date.now();
            this.activeTasks.set(taskId, task);
            try {
                // Check knowledge base for similar failed tasks
                const similarFailures = this.knowledgeBase.findSimilarDecisions(task.type)
                    .filter(d => d.outcome === 'failure');
                if (similarFailures.length > 0) {
                    return {
                        success: false,
                        output: `Similar tasks previously failed: ${similarFailures.map(f => f.rationale).join(', ')}`,
                        metrics: {
                            duration: Date.now() - startTime,
                            errorCount: 1
                        }
                    };
                }
                // Execute with retries
                let lastError = null;
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        const result = yield this.processTask(task);
                        this.knowledgeBase.recordDecision({
                            timestamp: new Date(),
                            taskId,
                            action: task.type,
                            rationale: 'Task executed successfully',
                            outcome: 'success',
                            version: 1
                        });
                        return {
                            success: result.success,
                            output: result.output,
                            metrics: Object.assign(Object.assign({}, (result.metrics || {})), { duration: Date.now() - startTime })
                        };
                    }
                    catch (error) {
                        lastError = error;
                        yield new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
                    }
                }
                throw lastError || new Error('Task execution failed');
            }
            catch (error) {
                this.knowledgeBase.recordDecision({
                    timestamp: new Date(),
                    taskId,
                    action: task.type,
                    rationale: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    outcome: 'failure',
                    version: 1
                });
                throw error;
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
                    logger: {
                        info: (msg) => console.log(`[INFO] ${msg}`),
                        error: (msg) => console.error(`[ERROR] ${msg}`)
                    }
                };
                const result = yield this.skillSet.executeSkill(task.type, task.parameters, context);
                if (this.knowledgeBase.linkDecisionToCode) {
                    const params = task.parameters;
                    if (typeof params.filePath === 'string') {
                        this.knowledgeBase.linkDecisionToCode(task.id, params.filePath);
                    }
                }
                return {
                    success: true,
                    output: result.output,
                    metrics: Object.assign({ duration: Date.now() - startTime }, (result.metrics || {}))
                };
            }
            catch (error) {
                return {
                    success: false,
                    output: (error instanceof Error ? error.message : String(error)),
                    metrics: {
                        duration: Date.now() - startTime,
                        errorCount: 1
                    }
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