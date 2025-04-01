import { v4 as uuidv4 } from 'uuid';
import { KnowledgeGraph } from './KnowledgeGraph';
import { EnhancedSkillRegistry } from './SkillRegistry';
import type { SkillContext, SkillExecutionResult } from './EnhancedSkillTypes';
import { AgentTask, TaskResult, KnowledgeGraphConfig, AgentDecision } from './types';

interface DynamicPrompt {
  id: string;
  content: string;
  priority: number;
}

interface ExtendedSkillContext extends SkillContext {
  dynamicPrompts: DynamicPrompt[];
  complexityScore: number;
}

interface TaskMetrics {
  duration: number;
  errorCount?: number;
  errorType?: string;
  [key: string]: unknown;
}

export class MAFIAAgent {
  private knowledgeBase: KnowledgeGraph;
  public readonly skillSet: EnhancedSkillRegistry;
  private activeTasks: Map<string, AgentTask>;
  private taskQueue: AgentTask[];
  public complexityScore: number = 0;
  private uiEventHandlers: Map<string, (data: unknown) => void> = new Map();
  
  constructor(config: { knowledgeGraph?: KnowledgeGraphConfig } = {}) {
    this.knowledgeBase = new KnowledgeGraph();
    this.skillSet = new EnhancedSkillRegistry();
    this.activeTasks = new Map();
    this.taskQueue = [];
  }

  public on(event: string, handler: (data: unknown) => void): void {
    this.uiEventHandlers.set(event, handler);
  }

  private emit(event: string, data: unknown): void {
    this.uiEventHandlers.get(event)?.(data);
  }

  private calculateComplexity(task: AgentTask): number {
    const baseComplexity = 1;
    const params = task.parameters as Record<string, unknown>;
    const paramComplexity = Object.keys(params).length * 0.5;
    const skillComplexity = 1;
    return Math.min(100, baseComplexity + paramComplexity + skillComplexity);
  }

  private classifyError(error: Error): { severity: number; type: string } {
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

  private logError(error: Error, context: string): void {
    const classification = this.classifyError(error);
    const decision: AgentDecision = {
      timestamp: new Date(),
      action: 'ERROR_LOG',
      rationale: `${context}: ${error.message} [Severity: ${classification.severity}, Type: ${classification.type}]`,
      outcome: 'failure',
      taskId: uuidv4(),
      version: 1
    };
    this.knowledgeBase.recordDecision(decision);
    this.emit('error_occurred', {
      message: error.message,
      severity: classification.severity,
      context
    });
  }

  private getDynamicPrompts(task: AgentTask): DynamicPrompt[] {
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

  async executeTask<T = unknown, R = unknown>(task: AgentTask<T>): Promise<TaskResult<R>> {
    const taskId = uuidv4();
    const startTime = Date.now();
    this.activeTasks.set(taskId, task);
    this.complexityScore = this.calculateComplexity(task);
    this.emit('task_start', { taskId, complexity: this.complexityScore });
    
    try {
      const similarFailures = this.knowledgeBase.findSimilarDecisions(task.type)
        .filter(d => d.outcome === 'failure');
      
      if (similarFailures.length > 0) {
        this.logError(
          new Error(`Similar tasks previously failed: ${similarFailures.map(f => f.rationale).join(', ')}`),
          'executeTask'
        );
        return {
          success: false,
          output: `Similar tasks previously failed` as unknown as R,
          metrics: {
            duration: Date.now() - startTime,
            errorCount: 1
          }
        };
      }

      const result = await this.processTask<T, R>(task);
      return result;
    } catch (error) {
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
        output: errorMessage as unknown as R,
        metrics: {
          duration: Date.now() - startTime,
          errorCount: 1,
          errorType: this.classifyError(errorObj).type
        }
      };
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  private async processTask<T, R>(task: AgentTask<T>): Promise<TaskResult<R>> {
    const startTime = Date.now();
    try {
      const context: ExtendedSkillContext = {
        requestId: task.id,
        agentId: 'mafia-agent',
        knowledgeGraph: this.knowledgeBase,
        dynamicPrompts: this.getDynamicPrompts(task),
        complexityScore: this.complexityScore,
        logger: {
          info: (msg: string) => {
            console.log(`[INFO] ${msg}`);
            this.emit('log_info', msg);
          },
          error: (msg: string) => {
            console.error(`[ERROR] ${msg}`);
            this.emit('log_error', msg);
          }
        }
      };

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API_TIMEOUT')), 5000));
      
      const result = await Promise.race<SkillExecutionResult>([
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
        const params = task.parameters as Record<string, unknown>;
        if (typeof params.filePath === 'string') {
          this.knowledgeBase.linkDecisionToCode(task.id, params.filePath);
        }
      }

      const metrics: TaskMetrics = {
        duration: Date.now() - startTime,
        ...(result.metrics || {})
      };
      
      return {
        success: true,
        output: result.output as R,
        metrics
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorObj = error instanceof Error ? error : new Error(errorMessage);
      const metrics: TaskMetrics = {
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
        output: errorMessage as unknown as R,
        metrics
      };
    }
  }

  async queueTask(task: AgentTask): Promise<void> {
    this.taskQueue.push(task);
    this.taskQueue.sort((a: AgentTask, b: AgentTask) => (b.priority || 0) - (a.priority || 0));
  }

  async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      await this.executeTask(task);
    }
  }
}