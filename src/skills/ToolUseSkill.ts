import { EnhancedSkillDefinition, SkillExecutionResult, SkillContext, SkillMetadata } from '../core/EnhancedSkillTypes';

const ToolUseParameters = {
  type: { 
    type: 'string' as const,
    enum: ['command', 'file-read', 'file-write', 'browser'],
    required: true,
    description: 'Type of tool operation'
  },
  command: { 
    type: 'string' as const,
    required: false,
    description: 'Command to execute'
  },
  path: { 
    type: 'string' as const,
    required: false,
    description: 'File path for file operations'
  },
  content: { 
    type: 'string' as const,
    required: false,
    description: 'Content for file write operations'
  },
  url: { 
    type: 'string' as const,
    required: false,
    description: 'URL for browser operations'
  },
  timeout: { 
    type: 'number' as const,
    required: false,
    description: 'Operation timeout in ms',
    default: 30000
  }
};

interface ToolMetrics {
  duration: number;
  type: string;
}
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface ToolParams {
  type: 'command' | 'file-read' | 'file-write' | 'browser';
  command?: string;
  path?: string;
  content?: string;
  url?: string;
  timeout?: number;
}

export const ToolUseSkill: EnhancedSkillDefinition = {
  metadata: {
    name: 'tool-use',
    version: '1.0.0',
    description: 'Execute system tools and operations',
    dependencies: [],
    parameters: ToolUseParameters
  },

  validate(params: any) {
    if (!params.type) {
      return { valid: false, errors: ['Type parameter is required'] };
    }

    const errors = [];
    if (params.type === 'command' && !params.command) {
      errors.push('Command is required for command type');
    }
    if ((params.type === 'file-read' || params.type === 'file-write') && !params.path) {
      errors.push('Path is required for file operations');
    }
    if (params.type === 'file-write' && !params.content) {
      errors.push('Content is required for file write');
    }
    if (params.type === 'browser' && !params.url) {
      errors.push('URL is required for browser operations');
    }

    return { valid: errors.length === 0, errors };
  },

  async execute(params: ToolParams, context?: SkillContext): Promise<SkillExecutionResult> {
    try {
      let output: any;
      const startTime = Date.now();

      switch (params.type) {
        case 'command':
          const { stdout, stderr } = await execAsync(params.command!, { 
            timeout: params.timeout 
          });
          output = { stdout, stderr };
          break;

        case 'file-read':
          if (!existsSync(params.path!)) {
            throw new Error(`File not found: ${params.path}`);
          }
          output = await readFile(params.path!, 'utf-8');
          break;

        case 'file-write':
          await writeFile(params.path!, params.content!);
          output = { success: true, path: params.path };
          break;

        case 'browser':
          // Browser operations will be handled by BrowserAutomationSkill
          throw new Error('Browser operations require BrowserAutomationSkill');
          
        default:
          throw new Error(`Unknown tool type: ${params.type}`);
      }

      return {
        success: true,
        output,
        metrics: {
          duration: Date.now() - startTime,
          // Additional metrics can be added under memoryUsage or cpuUsage
          // to match the SkillExecutionResult type
        }
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          duration: 0
        }
      };
    }
  }
};