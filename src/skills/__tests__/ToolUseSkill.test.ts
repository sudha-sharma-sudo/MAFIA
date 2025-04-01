import { ToolUseSkill } from '../ToolUseSkill';
import { SkillContext } from '../../core/EnhancedSkillTypes';

// Mock modules
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, options, callback) => {
    // Default mock implementation
    callback(null, { stdout: '', stderr: '' });
  })
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

const mockedExec = require('child_process').exec as jest.Mock;
const mockedReadFile = require('fs/promises').readFile as jest.Mock;
const mockedWriteFile = require('fs/promises').writeFile as jest.Mock;
const mockedExistsSync = require('fs').existsSync as jest.Mock;

describe('ToolUseSkill', () => {
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
    mockedExistsSync.mockReturnValue(true);
  });

  describe('command operations', () => {
    it('should execute command successfully', async () => {
      // Arrange
      mockedExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: 'command output', stderr: '' });
      });

      // Act
      const result = await ToolUseSkill.execute(
        { type: 'command', command: 'ls -la' },
        mockContext
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.output.stdout).toBe('command output');
    }, 30000); // 30s timeout

    it('should handle command timeout', async () => {
      // Arrange
      mockedExec.mockImplementation((cmd, options, callback) => {
        const error = new Error('Command timed out');
        (error as any).code = 'ETIMEDOUT';
        callback(error);
      });

      // Act
      const result = await ToolUseSkill.execute(
        { type: 'command', command: 'sleep 10', timeout: 100 },
        mockContext
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Command timed out');
    }, 30000); // 30s timeout
  });

  describe('file operations', () => {
    it('should read file successfully', async () => {
      mockedReadFile.mockResolvedValue('file content');
      
      const result = await ToolUseSkill.execute(
        { type: 'file-read', path: 'test.txt' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.output).toBe('file content');
    });

    it('should handle missing file', async () => {
      mockedExistsSync.mockReturnValue(false);
      
      const result = await ToolUseSkill.execute(
        { type: 'file-read', path: 'missing.txt' },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });
  });

  describe('validation', () => {
    it('should require type parameter', () => {
      if (!ToolUseSkill.validate) {
        fail('validate method is undefined');
      }
      const validation = ToolUseSkill.validate({});
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Type parameter is required');
    });

    it('should validate command operations', () => {
      if (!ToolUseSkill.validate) {
        fail('validate method is undefined');
      }
      const validation = ToolUseSkill.validate({ type: 'command' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Command is required for command type');
    });

    it('should validate file operations', () => {
      if (!ToolUseSkill.validate) {
        fail('validate method is undefined');
      }
      const validation = ToolUseSkill.validate({ type: 'file-read' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Path is required for file operations');
    });
  });
});