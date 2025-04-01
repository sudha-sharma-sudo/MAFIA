import { FileSystemSkill } from '../FileSystemSkill';
import { SkillContext } from '../../core/EnhancedSkillTypes';
import fs from 'fs/promises';
import path from 'path';

interface FSError extends Error {
  code?: string;
}

describe('FileSystemSkill', () => {
  const mockContext: SkillContext = {
    requestId: 'test-request',
    agentId: 'test-agent',
    knowledgeGraph: {
      recordDecision: jest.fn(),
      findSimilarDecisions: jest.fn().mockReturnValue([]),
      linkDecisionToCode: jest.fn()
    },
    logger: {
      info: jest.fn(),
      error: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('read operation', () => {
    it('should successfully read file', async () => {
      jest.spyOn(fs, 'readFile').mockResolvedValue('file content');
      const result = await FileSystemSkill.execute(
        { operation: 'read', path: 'test.txt' },
        mockContext
      );
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('file content');
    });

    it('should handle ENOENT errors', async () => {
      const error: FSError = new Error('File not found');
      error.code = 'ENOENT';
      jest.spyOn(fs, 'readFile').mockRejectedValue(error);
      
      const result = await FileSystemSkill.execute(
        { operation: 'read', path: 'missing.txt' },
        mockContext
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
      expect(result.metrics).toHaveProperty('duration');
    });

    it('should handle permission errors', async () => {
      const error: FSError = new Error('Permission denied');
      error.code = 'EACCES';
      jest.spyOn(fs, 'readFile').mockRejectedValue(error);
      
      const result = await FileSystemSkill.execute(
        { operation: 'read', path: 'restricted.txt' },
        mockContext
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });
  });

  describe('write operation', () => {
    it('should successfully write file', async () => {
      jest.spyOn(fs, 'writeFile').mockResolvedValue();
      const result = await FileSystemSkill.execute(
        { operation: 'write', path: 'output.txt', content: 'data' },
        mockContext
      );
      
      expect(result.success).toBe(true);
      expect(result.output.status).toBe('written');
    });

    it('should handle directory creation errors', async () => {
      const error: FSError = new Error('No such directory');
      error.code = 'ENOENT';
      jest.spyOn(fs, 'writeFile').mockRejectedValue(error);
      
      const result = await FileSystemSkill.execute(
        { operation: 'write', path: 'missing/output.txt', content: 'data' },
        mockContext
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such directory');
    });
  });

  describe('validation', () => {
    it('should reject missing operation', () => {
      if (!FileSystemSkill.validate) {
        fail('validate method is undefined');
      }
      const validation = FileSystemSkill.validate({ path: 'test.txt' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Operation parameter is required');
    });

    it('should reject missing path', () => {
      if (!FileSystemSkill.validate) {
        fail('validate method is undefined');
      }
      const validation = FileSystemSkill.validate({ operation: 'read' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Path parameter is required');
    });

    it('should reject write without content', () => {
      if (!FileSystemSkill.validate) {
        fail('validate method is undefined');
      }
      const validation = FileSystemSkill.validate({ 
        operation: 'write', 
        path: 'test.txt' 
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Content is required for write operations');
    });
  });
});