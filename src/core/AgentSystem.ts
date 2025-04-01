import { v4 as uuidv4 } from 'uuid';
import { KnowledgeGraph } from './KnowledgeGraph';
import { EnhancedSkillRegistry } from './SkillRegistry';
import type { SkillContext, SkillExecutionResult } from './EnhancedSkillTypes';
import { AgentTask, TaskResult, KnowledgeGraphConfig } from './types';

export class MAFIAAgent {
  private knowledgeBase: KnowledgeGraph;
  public readonly skillSet: EnhancedSkillRegistry;
  private activeTasks: Map<string, AgentTask>;
  private taskQueue: AgentTask[];
  
  constructor(config: { knowledgeGraph?: KnowledgeGraphConfig } = {}) {
    this.knowledgeBase = new KnowledgeGraph();
    this.skillSet = new EnhancedSkillRegistry();
    this.activeTasks = new Map();
    this.taskQueue = [];
  }

  async executeTask(task: AgentTask): Promise<TaskResult> {
    const taskId = uuidv4();
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
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await this.processTask(task);
          this.knowledgeBase.recordDecision({
            timestamp: new Date(),
            taskId,
            action: task.type,
            rationale: 'Task executed successfully',
            outcome: 'success',
            version: 1
          });
          return {
            ...result,
            metrics: {
              ...result.metrics,
              duration: Date.now() - startTime
            }
          };
        } catch (error) {
          lastError = error as Error;
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }

      throw lastError || new Error('Task execution failed');
    } catch (error) {
      this.knowledgeBase.recordDecision({
        timestamp: new Date(),
        taskId,
        action: task.type,
        rationale: `Error: ${error instanceof Error ? error.message : String(error)}`,
        outcome: 'failure',
        version: 1
      });
      throw error;
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  private async processTask(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    try {
      const context: SkillContext = {
        requestId: task.id,
        agentId: 'mafia-agent',
        knowledgeGraph: this.knowledgeBase,
        logger: {
          info: (msg) => console.log(`[INFO] ${msg}`),
          error: (msg) => console.error(`[ERROR] ${msg}`)
        }
      };
      
      const result = await this.skillSet.executeSkill(
        task.type, 
        task.parameters,
        context
      );
      
      if (task.parameters.filePath && this.knowledgeBase.linkDecisionToCode) {
        this.knowledgeBase.linkDecisionToCode(task.id, task.parameters.filePath);
      }

      return {
        success: true,
        output: result.output,
        metrics: {
          duration: Date.now() - startTime,
          ...(result.metrics || {})
        }
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        metrics: {
          duration: Date.now() - startTime,
          errorCount: 1
        }
      };
    }
  }

  async queueTask(task: AgentTask): Promise<void> {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      await this.executeTask(task);
    }
  }
}