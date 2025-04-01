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
exports.KnowledgeGraph = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KnowledgeGraph {
    constructor(config = {}) {
        this.decisions = [];
        this.codeContexts = new Map();
        this.config = Object.assign({ maxHistoryItems: 1000, persistToDisk: false }, config);
    }
    recordDecision(decision) {
        decision.version = (decision.version || 0) + 1;
        this.decisions.push(decision);
        if (this.decisions.length > this.config.maxHistoryItems) {
            this.decisions.shift();
        }
    }
    addCodeContext(context) {
        this.codeContexts.set(context.filePath, context);
    }
    getRelevantContext(filePath) {
        return this.codeContexts.get(filePath);
    }
    findSimilarDecisions(taskType) {
        return this.decisions.filter(d => d.action.includes(taskType));
    }
    linkDecisionToCode(decisionId, filePath) {
        const decision = this.decisions.find(d => d.taskId === decisionId);
        if (decision) {
            // Removed relatedFiles as it's not in AgentDecision interface
            return;
        }
    }
    saveToDisk(filePath = 'knowledge.json') {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.persistToDisk)
                return;
            try {
                const data = JSON.stringify({
                    decisions: this.decisions,
                    contexts: Object.fromEntries(this.codeContexts)
                });
                yield fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                yield fs.promises.writeFile(filePath, data);
            }
            catch (error) {
                console.error('Failed to save knowledge graph:', error);
            }
        });
    }
}
exports.KnowledgeGraph = KnowledgeGraph;
//# sourceMappingURL=KnowledgeGraph.js.map