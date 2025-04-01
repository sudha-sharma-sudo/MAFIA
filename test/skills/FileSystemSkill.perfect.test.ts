import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as fs from 'fs/promises';
import * as path from 'path';

// Create mocks that exactly match the implementation
const mockFs = {
  writeFile: jest.fn().mockImplementation((filePath, content) => {
    if (filePath.includes('invalid')) {
      return Promise.reject(new Error('ENOENT: no such file or directory'));
    }
    return Promise.resolve();
  }),
  readFile: jest.fn().mockImplementation((filePath, encoding) => {
    if (filePath.includes('nonexistent')) {
      return Promise.reject(new Error('ENOENT: no such file or directory'));
    }
    return Promise.resolve('test content');
  }),
  unlink: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt']),
  stat: jest.fn().mockResolvedValue({ 
    size: 1024,
    isFile: () => true,
    isDirectory: () => false 
  })
};

jest.mock('fs/promises', () => mockFs);

describe('FileSystemSkill', () => {
  const testFile = '/test/file.txt';
  const testContent = 'test content';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate parameters', () => {
      if (!FileSystemSkill.validate) {
        throw new Error('validate function not found');
      }
      
      const validRead = FileSystemSkill.validate({ operation: 'read', path: testFile });
      expect(validRead.valid).toBe(true);

      const validWrite = FileSystemSkill.validate({ 
        operation: 'write', 
        path: testFile,
        content: testContent
      });
      expect(validWrite.valid).toBe(true);

      const invalid = FileSystemSkill.validate({ operation: 'write' });
      expect(invalid.valid).toBe(false);
    });
  });

  describe('write operations', () => {
    it('should successfully write files', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      
      const result = await FileSystemSkill.execute({
        operation: 'write',
        path: testFile,
        content: testContent
      });

      expect(result).toEqual({
        success: true,
        output: {
          path: path.resolve(testFile),
          status: 'written'
        },
        metrics: {
          duration: expect.any(Number),
          memoryUsage: expect.any(Number)
        }
      });
    });

    it('should handle write errors', async () => {
      mockFs.writeFile.mockRejectedValueOnce(new Error('Disk full'));
      
      const result = await FileSystemSkill.execute({
        operation: 'write',
        path: '/invalid/file.txt',
        content: testContent
      });

      expect(result).toEqual({
        success: false,
        output: null,
        error: 'Disk full',
        metrics: {
          duration: expect.any(Number)
        }
      });
    });
  });

  describe('read operations', () => {
    it('should successfully read files', async () => {
      mockFs.readFile.mockResolvedValueOnce('test content');
      
      const result = await FileSystemSkill.execute({
        operation: 'read',
        path: testFile
      });

      expect(result).toEqual({
        success: true,
        output: 'test content',
        metrics: {
          duration: expect.any(Number),
          memoryUsage: expect.any(Number)
        }
      });
    });

    it('should handle read errors', async () => {
      mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
      
      const result = await FileSystemSkill.execute({
        operation: 'read',
        path: '/nonexistent/file.txt'
      });

      expect(result).toEqual({
        success: false,
        output: null,
        error: 'ENOENT: no such file or directory',
        metrics: {
          duration: expect.any(Number)
        }
      });
    });
  });
});