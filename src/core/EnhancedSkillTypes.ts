import { EventEmitter } from 'events';

export interface SkillMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  documentation?: string;
  dependencies?: string[];
  parameters?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required: boolean;
      description: string;
      default?: any;
      validation?: (value: any) => boolean;
    };
  };
}

export interface EnhancedSkillDefinition {
  metadata: SkillMetadata;
  execute: (params: any, context?: SkillContext) => Promise<SkillExecutionResult>;
  timeout?: number;
  validate?: (params: any) => ValidationResult;
  on?: (event: 'progress', listener: (progress: number) => void) => void;
}

export interface SkillContext {
  requestId: string;
  agentId: string;
  knowledgeGraph: any;
  logger: {
    info: (message: string) => void;
    error: (message: string) => void;
  };
}

export interface SkillExecutionResult {
  success: boolean;
  output: any;
  artifacts?: Record<string, any>;
  metrics?: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  warnings?: string[];
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export class SkillEventEmitter extends EventEmitter {
  constructor() {
    super();
  }
}