import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as fs from 'fs/promises';
import * as path from 'path';

// Create a complete mock of fs.promises
const mockFs = {
  writeFile: jest.fn().mockImplementation((filePath, content) => {
    if (filePath.includes('invalid')) {
      return Promise.reject(new Error('Disk full'));
    }
    return Promise.resolve();
  }),
  readFile: jest.fn().mockImplementation((filePath, encoding) => {
    if (filePath.includes('nonexistent')) {
      return Promise.reject(new Error('ENOENT: no such file or directory'));
    }
    return Promise.resolve('test content');
  }),
  stat: jest.fn().mockResolvedValue({ 
    size: 1024,
    isFile: () => true,
    isDirectory: () => false 
  })
};

jest.mock('fs/promises', () => mockFs);

describe('FileSystemSkill', () => {
  const testFile = '/valid/file.txt';
  const testContent = 'test content';

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful mocks
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('test content');
  });

  it('should validate parameters', () => {
    if (!FileSystemSkill.validate) {
      throw new Error('validate function not found');
    }
    
    const valid = FileSystemSkill.validate({ operation: 'read', path: testFile });
    expect(valid.valid).toBe(true);

    const invalid = FileSystemSkill.validate({ operation: 'write' });
    expect(invalid.valid).toBe(false);
  });

  it('should successfully write files', async () => {
    const result = await FileSystemSkill.execute({
      operation: 'write',
      path: testFile,
      content: testContent
    });

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({
      path: expect.stringContaining(testFile),
      status: 'written'
    });
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      path.resolve(testFile), 
      testContent
    );
  });

  it('should handle write errors', async () => {
    mockFs.writeFile.mockRejectedValueOnce(new Error('Disk full'));
    
    const result = await FileSystemSkill.execute({
      operation: 'write',
      path: '/invalid/file.txt',
      content: testContent
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Disk full');
  });

  it('should successfully read files', async () => {
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: testFile
    });

    expect(result.success).toBe(true);
    expect(result.output).toBe('test content');
    expect(mockFs.readFile).toHaveBeenCalledWith(
      path.resolve(testFile),
      'utf-8'
    );
  });
});