export interface SkillDefinition {
  name: string;
  description: string;
  parameters: Record<string, ParameterDefinition>;
  execute: (params: any, context?: SkillContext) => Promise<SkillExecutionResult>;
}

export interface ParameterDefinition {
  type: string;
  required: boolean;
  description: string;
  default?: any;
  enum?: string[];
}

export interface SkillExecutionResult {
  output: any;
  success: boolean;
  metrics: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
    [key: string]: any;
  };
  artifacts?: any[];
}

export interface SkillContext {
  requestId: string;
  agentId: string;
  knowledgeGraph: any;
  logger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export interface AgentTask {
  id: string;
  type: string;
  parameters: any;
  priority?: number;
}

export interface TaskResult {
  success: boolean;
  output: any;
  metrics: {
    duration: number;
    errorCount?: number;
    [key: string]: any;
  };
}

export interface KnowledgeGraphConfig {
  persistToDisk?: boolean;
  maxHistoryItems?: number;
}

export interface AgentDecision {
  timestamp: Date;
  taskId: string;
  action: string;
  rationale: string;
  outcome: 'success' | 'failure';
  version: number;
}

export interface CodeContext {
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
}