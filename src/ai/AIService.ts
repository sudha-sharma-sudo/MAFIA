// Use global mock in test, real vscode in production
declare global {
  var vscode: any;
}
const vscode = process.env.NODE_ENV === 'test'
  ? global.vscode
  : require('vscode');
import { v4 as uuidv4 } from 'uuid';
import { MAFIAAgent } from '../core/AgentSystem';
import { KnowledgeGraphConfig, AgentTask, SkillExecutionResult } from '../core/types';

export class AIService {
  private agent: MAFIAAgent;
  private cache = new Map<string, any>();
  private apiKey: string;

  constructor(config: { knowledgeGraph?: KnowledgeGraphConfig; apiKey?: string } = {}) {
    this.apiKey = config.apiKey || '';
    this.agent = new MAFIAAgent({
      knowledgeGraph: {
        persistToDisk: true,
        maxHistoryItems: 1000,
        ...config.knowledgeGraph
      }
    });
  }

  public async executeSkill(skillName: string, params: any): Promise<SkillExecutionResult> {
    const cacheKey = `${skillName}:${JSON.stringify(params)}`;
    const task: AgentTask = {
      id: uuidv4(),
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
      const result = await this.agent.executeTask(task);
      const duration = Date.now() - startTime;
      
      if (result.success && result.output) {
        this.cache.set(cacheKey, result.output);
      }
      
      return {
        ...result,
        metrics: {
          ...result.metrics,
          duration
        }
      };
    } catch (error) {
      vscode.window.showErrorMessage(
        `Skill execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  public async analyzeCode(code: string): Promise<string> {
    const result = await this.executeSkill('code-analysis', { code });
    return result.output;
  }

  public async refactorCode(code: string, refactorType?: string): Promise<string> {
    const result = await this.executeSkill('code-refactor', { 
      code,
      refactorType: refactorType || 'optimize'
    });
    return result.output;
  }

  public async processQuery(query: string): Promise<string> {
    return this.analyzeCode(query);
  }

  public async generateDocumentation(code: string): Promise<string> {
    return this.analyzeCode(code);
  }

  public clearCache(): void {
    this.cache.clear();
    if ('clearCache' in this.agent.skillSet) {
      (this.agent.skillSet as any).clearCache();
    }
  }
}
