import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as fs from 'fs/promises';
import * as path from 'path';

// Create mocks that match the actual implementation
const mockFs = {
  writeFile: jest.fn().mockImplementation((path, content) => {
    if (path.includes('invalid')) {
      return Promise.reject(new Error('Disk full'));
    }
    return Promise.resolve();
  }),
  readFile: jest.fn().mockImplementation((path, encoding) => {
    if (path.includes('nonexistent')) {
      return Promise.reject(new Error('ENOENT'));
    }
    return Promise.resolve('test content');
  }),
  stat: jest.fn().mockResolvedValue({})
};

jest.mock('fs/promises', () => mockFs);

describe('FileSystemSkill', () => {
  const testFile = '/test/file.txt';
  const testContent = 'test content';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate parameters', () => {
    if (!FileSystemSkill.validate) throw new Error('validate not found');
    
    const valid = FileSystemSkill.validate({ operation: 'read', path: testFile });
    expect(valid.valid).toBe(true);

    const invalid = FileSystemSkill.validate({ operation: 'write' });
    expect(invalid.valid).toBe(false);
  });

  describe('write operations', () => {
    it('should successfully write files', async () => {
      if (!FileSystemSkill.execute) throw new Error('execute not found');
      
      // Setup mock
      mockFs.writeFile.mockResolvedValue(undefined);
      
      const result = await FileSystemSkill.execute({
        operation: 'write',
        path: testFile,
        content: testContent
      });

      expect(result).toMatchObject({
        success: true,
        output: {
          path: path.resolve(testFile),
          status: 'written'
        }
      });
    });

    it('should handle write errors', async () => {
      if (!FileSystemSkill.execute) throw new Error('execute not found');
      
      // Setup mock error
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));
      
      const result = await FileSystemSkill.execute({
        operation: 'write',
        path: '/invalid/file.txt',
        content: testContent
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Disk full');
    });
  });

  describe('read operations', () => {
    it('should successfully read files', async () => {
      if (!FileSystemSkill.execute) throw new Error('execute not found');
      
      // Setup mock
      mockFs.readFile.mockResolvedValue('test content');
      
      const result = await FileSystemSkill.execute({
        operation: 'read',
        path: testFile
      });

      expect(result).toMatchObject({
        success: true,
        output: 'test content'
      });
    });

    it('should handle read errors', async () => {
      if (!FileSystemSkill.execute) throw new Error('execute not found');
      
      // Setup mock error
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
      
      const result = await FileSystemSkill.execute({
        operation: 'read',
        path: '/nonexistent/file.txt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ENOENT');
    });
  });
});