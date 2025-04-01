import { AgentDecision, CodeContext, KnowledgeGraphConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class KnowledgeGraph {
  private decisions: AgentDecision[] = [];
  private codeContexts: Map<string, CodeContext> = new Map();
  private config: KnowledgeGraphConfig;

  constructor(config: KnowledgeGraphConfig = {}) {
    this.config = {
      maxHistoryItems: 1000,
      persistToDisk: false,
      ...config
    };
  }

  recordDecision(decision: AgentDecision): void {
    decision.version = (decision.version || 0) + 1;
    this.decisions.push(decision);
    if (this.decisions.length > this.config.maxHistoryItems!) {
      this.decisions.shift();
    }
  }

  addCodeContext(context: CodeContext): void {
    this.codeContexts.set(context.filePath, context);
  }

  getRelevantContext(filePath: string): CodeContext | undefined {
    return this.codeContexts.get(filePath);
  }

  findSimilarDecisions(taskType: string): AgentDecision[] {
    return this.decisions.filter(d => d.action.includes(taskType));
  }

  linkDecisionToCode(decisionId: string, filePath: string): void {
    const decision = this.decisions.find(d => d.taskId === decisionId);
    if (decision) {
      // Removed relatedFiles as it's not in AgentDecision interface
      return;
    }
  }

  async saveToDisk(filePath: string = 'knowledge.json'): Promise<void> {
    if (!this.config.persistToDisk) return;
    
    try {
      const data = JSON.stringify({
        decisions: this.decisions,
        contexts: Object.fromEntries(this.codeContexts)
      });
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, data);
    } catch (error) {
      console.error('Failed to save knowledge graph:', error);
    }
  }
}
