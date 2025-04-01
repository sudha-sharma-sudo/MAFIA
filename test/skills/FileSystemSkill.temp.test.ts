import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

// Mock fs.promises methods
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockImplementation((path) => 
    path.includes('nonexistent') 
      ? Promise.reject(new Error('ENOENT')) 
      : Promise.resolve('test content')
  ),
  stat: jest.fn().mockResolvedValue({ size: 1024 }),
  mkdir: jest.fn().mockResolvedValue(undefined),
  rm: jest.fn().mockResolvedValue(undefined)
}));

// Mock vscode API
jest.mock('vscode', () => ({
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn()
  },
  commands: {
    registerCommand: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn()
  },
  env: {
    machineId: 'test-machine-id'
  }
}));

describe('FileSystemSkill', () => {
  const testFile = '/test/file.txt';
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

    const invalid = FileSystemSkill.validate({ operation: 'write' });
    expect(invalid.valid).toBe(false);
  });

  it('should handle file operations', async () => {
    // Test write
    const writeResult = await FileSystemSkill.execute({
      operation: 'write', 
      path: testFile,
      content: testContent
    });
    expect(writeResult.success).toBe(true);
    expect(fs.writeFile).toHaveBeenCalledWith(testFile, testContent);

    // Test read
    const readResult = await FileSystemSkill.execute({
      operation: 'read',
      path: testFile
    });
    expect(readResult.success).toBe(true);
    expect(readResult.output).toBe(testContent);
  });

  it('should handle errors', async () => {
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: '/nonexistent/file.txt' 
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('ENOENT');
  });
});