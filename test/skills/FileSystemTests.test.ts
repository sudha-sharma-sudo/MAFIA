import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as path from 'path';

// Mock only the fs methods we need
const mockFs = {
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('content'),
  unlink: jest.fn().mockResolvedValue(undefined)
};

jest.mock('fs/promises', () => mockFs);

describe('FileSystemSkill', () => {
  const testFile = path.resolve('test.txt');
  const testContent = 'test content';

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

  it('should read files successfully', async () => {
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

  it('should write files successfully', async () => {
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
    mockFs.readFile.mockRejectedValueOnce(new Error('ENOENT'));
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: 'missing.txt'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('ENOENT');
  });
});