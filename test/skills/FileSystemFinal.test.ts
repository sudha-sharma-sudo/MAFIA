import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as path from 'path';

// Mock only the fs methods we actually use
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate parameters', () => {
    if (!FileSystemSkill.validate) {
      throw new Error('validate function not found');
    }
    const valid = FileSystemSkill.validate({ operation: 'read', path: testFile });
    expect(valid.valid).toBe(true);
  });

  it('should successfully read files', async () => {
    if (!FileSystemSkill.execute) {
      throw new Error('execute function not found');
    }
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: testFile
    });
    
    expect(result.success).toBe(true);
    expect(result.output).toBe('content');
    expect(mockFs.readFile).toHaveBeenCalledWith(testFile, 'utf-8');
  });

  it('should successfully write files', async () => {
    if (!FileSystemSkill.execute) {
      throw new Error('execute function not found');
    }
    const result = await FileSystemSkill.execute({
      operation: 'write',
      path: testFile,
      content: testContent
    });
    
    expect(result.success).toBe(true);
    expect(mockFs.writeFile).toHaveBeenCalledWith(testFile, testContent);
  });

  it('should handle read errors', async () => {
    if (!FileSystemSkill.execute) {
      throw new Error('execute function not found');
    }
    mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: 'missing.txt'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('ENOENT');
  });
});