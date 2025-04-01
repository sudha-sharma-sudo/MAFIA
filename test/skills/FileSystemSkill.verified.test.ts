import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as fs from 'fs/promises';
import * as path from 'path';

// Simple mocks that just verify the calls
const mockFs = {
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('content'),
  unlink: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue(['file1.txt']),
  stat: jest.fn().mockResolvedValue({ size: 1024 })
};

jest.mock('fs/promises', () => mockFs);

describe('FileSystemSkill', () => {
  const testFile = path.resolve('test.txt');
  const testContent = 'content';
  const missingFile = path.resolve('missing.txt');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate parameters correctly', () => {
    if (!FileSystemSkill.validate) {
      throw new Error('validate function not found');
    }
    
    const valid = FileSystemSkill.validate({ operation: 'read', path: testFile });
    expect(valid.valid).toBe(true);

    const invalid = FileSystemSkill.validate({ operation: 'write' });
    expect(invalid.valid).toBe(false);
  });

  it('should execute read operations', async () => {
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: testFile
    });

    expect(result.success).toBe(true);
    expect(result.output).toBe('content');
    expect(mockFs.readFile).toHaveBeenCalledWith(testFile, 'utf-8');
  });

  it('should execute write operations', async () => {
    const result = await FileSystemSkill.execute({
      operation: 'write',
      path: testFile,
      content: testContent
    });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({
      path: path.resolve(testFile),
      status: 'written'
    });
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      path.resolve(testFile),
      testContent
    );
  });

  it('should handle read errors', async () => {
    mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
    
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: 'missing.txt'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('ENOENT');
  });
});