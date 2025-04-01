import { FileSystemSkill } from '../FileSystemSkill';
import { SkillContext } from '../../core/EnhancedSkillTypes';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn().mockImplementation(() => Promise.resolve([])),
    stat: jest.fn()
  },
  Dirent: class {}
}));

const mockedFsPromises = fsPromises as jest.Mocked<typeof fsPromises>;

describe('FileSystemSkill', () => {
  const mockContext: SkillContext = {
    requestId: 'test-request',
    agentId: 'test-agent',
    logger: {
      info: jest.fn(),
      error: jest.fn()
    },
    knowledgeGraph: {
      recordDecision: jest.fn(),
      findSimilarDecisions: jest.fn().mockReturnValue([]),
      linkDecisionToCode: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('should have validate method', () => {
      expect(FileSystemSkill.validate).toBeDefined();
    });

    it('should require path parameter', () => {
      if (!FileSystemSkill.validate) return;
      const validation = FileSystemSkill.validate({ operation: 'read' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Path parameter is required');
    });

    it('should require content for write operations', () => {
      if (!FileSystemSkill.validate) return;
      const validation = FileSystemSkill.validate({ 
        operation: 'write',
        path: 'test.txt'
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Content is required for write operations');
    });

    it('should validate operation types', () => {
      if (!FileSystemSkill.validate) return;
      const validation = FileSystemSkill.validate({ 
        operation: 'invalid',
        path: 'test.txt'
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid operation type');
    });
  });

  describe('file operations', () => {
    it('should read file successfully', async () => {
      mockedFsPromises.readFile.mockResolvedValue('file content');
      const result = await FileSystemSkill.execute({
        operation: 'read',
        path: 'test.txt'
      }, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('file content');
      expect(mockedFsPromises.readFile).toHaveBeenCalledWith(
        path.resolve('test.txt'), 
        'utf-8'
      );
    });

    it('should write file successfully', async () => {
      mockedFsPromises.writeFile.mockResolvedValue(undefined);
      const result = await FileSystemSkill.execute({
        operation: 'write',
        path: 'test.txt',
        content: 'new content'
      }, mockContext);
      
      expect(result.success).toBe(true);
      expect(mockedFsPromises.writeFile).toHaveBeenCalledWith(
        path.resolve('test.txt'),
        'new content',
        'utf-8'
      );
    });

    it('should delete file successfully', async () => {
      mockedFsPromises.unlink.mockResolvedValue(undefined);
      const result = await FileSystemSkill.execute({
        operation: 'delete',
        path: 'test.txt'
      }, mockContext);
      
      expect(result.success).toBe(true);
      expect(mockedFsPromises.unlink).toHaveBeenCalledWith(
        path.resolve('test.txt')
      );
    });

    it('should list directory contents', async () => {
      const mockDirent1 = {
        name: 'file1.txt',
        isFile: () => true,
        isDirectory: () => false
      } as fs.Dirent;
      const mockDirent2 = {
        name: 'file2.txt', 
        isFile: () => true,
        isDirectory: () => false
      } as fs.Dirent;
      mockedFsPromises.readdir.mockResolvedValue([mockDirent1, mockDirent2]);
      const result = await FileSystemSkill.execute({
        operation: 'list',
        path: 'test_dir'
      }, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.output).toEqual(['file1.txt', 'file2.txt']);
    });

    it('should handle read errors', async () => {
      mockedFsPromises.readFile.mockRejectedValue(new Error('File not found'));
      const result = await FileSystemSkill.execute({
        operation: 'read',
        path: 'missing.txt'
      }, mockContext);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });
  });
});