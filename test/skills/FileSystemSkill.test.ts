import { FileSystemSkill } from '../../src/skills/FileSystemSkill';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import vscode from '../mocks/vscode';

jest.mock('fs/promises');
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
  const testDir = path.join(tmpdir(), 'mafia-test');
  const testFile = path.join(testDir, 'test.txt');
  const testContent = 'test content';

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should validate parameters', () => {
    if (!FileSystemSkill.validate) {
      throw new Error('validate function not found');
    }
    
    const valid = FileSystemSkill.validate({ operation: 'read', path: testFile });
    expect(valid.valid).toBe(true);

    const invalid = FileSystemSkill.validate({ operation: 'write' });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain('Path parameter is required');
  });

  it('should read and write files', async () => {
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue(testContent);

    const writeResult = await FileSystemSkill.execute({
      operation: 'write',
      path: testFile,
      content: testContent
    });
    expect(writeResult.success).toBe(true);

    const readResult = await FileSystemSkill.execute({
      operation: 'read',
      path: testFile
    });
    expect(readResult.success).toBe(true);
    expect(readResult.output).toBe(testContent);
  });

  it('should handle file stats', async () => {
    (fs.stat as jest.Mock).mockResolvedValue({ size: 1024 });
    
    const result = await FileSystemSkill.execute({
      operation: 'stat',
      path: testFile
    });
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('size');
  });

  it('should handle errors', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));
    
    const result = await FileSystemSkill.execute({
      operation: 'read',
      path: '/nonexistent/file.txt'
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('ENOENT');
  });
});