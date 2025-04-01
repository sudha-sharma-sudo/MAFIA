import { EnhancedSkillDefinition, SkillExecutionResult, SkillContext } from '../core/EnhancedSkillTypes';
import { promises as fs } from 'fs';
import path from 'path';

const FileSystemParameters = {
  operation: {
    type: 'string' as const,
    enum: ['read', 'write', 'delete', 'list', 'stat'],
    required: true,
    description: 'File system operation to perform'
  },
  path: {
    type: 'string' as const,
    required: true,
    description: 'File or directory path'
  },
  content: {
    type: 'string' as const,
    required: false,
    description: 'Content for write operations'
  },
  recursive: {
    type: 'boolean' as const,
    required: false,
    description: 'Perform operation recursively',
    default: false
  }
};

export const FileSystemSkill: EnhancedSkillDefinition = {
  metadata: {
    name: 'file-system',
    version: '1.0.0',
    description: 'Perform file system operations',
    dependencies: [],
    parameters: FileSystemParameters
  },

  validate(params: any) {
    if (!params.operation) {
      return { valid: false, errors: ['Operation parameter is required'] };
    }
    if (!params.path) {
      return { valid: false, errors: ['Path parameter is required'] };
    }
    if (params.operation === 'write' && !params.content) {
      return { valid: false, errors: ['Content is required for write operations'] };
    }
    return { valid: true };
  },

  async execute(params: any, context?: SkillContext): Promise<SkillExecutionResult> {
    const startTime = Date.now();
    try {
      let output: any;
      const fullPath = path.resolve(params.path);

      switch (params.operation) {
        case 'read':
          output = await fs.readFile(fullPath, 'utf-8');
          break;

        case 'write':
          await fs.writeFile(fullPath, params.content);
          output = { path: fullPath, status: 'written' };
          break;

        case 'delete':
          await fs.unlink(fullPath);
          output = { path: fullPath, status: 'deleted' };
          break;

        case 'list':
          output = await fs.readdir(fullPath);
          break;

        case 'stat':
          output = await fs.stat(fullPath);
          break;
      }

      return {
        success: true,
        output,
        metrics: {
          duration: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed
        }
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          duration: Date.now() - startTime
        }
      };
    }
  }
};