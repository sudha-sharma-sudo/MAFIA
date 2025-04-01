export interface SkillDefinition<T = unknown, R = unknown> {
  name: string;
  description: string;
  parameters: Record<string, ParameterDefinition>;
  execute: (params: T, context?: SkillContext) => Promise<SkillExecutionResult<R>>;
}

export interface ParameterDefinition {
  type: string;
  required: boolean;
  description: string;
  default?: unknown;
  enum?: string[];
}

export interface SkillExecutionResult<T = unknown> {
  output: T;
  success: boolean;
  metrics: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
    [key: string]: unknown;
  };
  artifacts?: unknown[];
}

export interface SkillContext {
  requestId: string;
  agentId: string;
  knowledgeGraph: unknown;
  logger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export interface AgentTask<T = unknown> {
  id: string;
  type: string;
  parameters: T;
  priority?: number;
  critical?: boolean; // When true, high severity errors will reject the promise
}

export interface TaskResult<T = unknown> {
  success: boolean;
  output: T;
  metrics: {
    duration: number;
    errorCount?: number;
    [key: string]: unknown;
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