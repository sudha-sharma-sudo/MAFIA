"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ToolUseSkill_1 = require("../ToolUseSkill");
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
const mockedExec = require('child_process').exec;
const mockedReadFile = require('fs/promises').readFile;
const mockedWriteFile = require('fs/promises').writeFile;
const mockedExistsSync = require('fs').existsSync;
describe('ToolUseSkill', () => {
    const mockContext = {
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
        it('should execute command successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockedExec.mockImplementation((cmd, options, callback) => {
                callback(null, { stdout: 'command output', stderr: '' });
            });
            // Act
            const result = yield ToolUseSkill_1.ToolUseSkill.execute({ type: 'command', command: 'ls -la' }, mockContext);
            // Assert
            expect(result.success).toBe(true);
            expect(result.output.stdout).toBe('command output');
        }), 30000); // 30s timeout
        it('should handle command timeout', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockedExec.mockImplementation((cmd, options, callback) => {
                const error = new Error('Command timed out');
                error.code = 'ETIMEDOUT';
                callback(error);
            });
            // Act
            const result = yield ToolUseSkill_1.ToolUseSkill.execute({ type: 'command', command: 'sleep 10', timeout: 100 }, mockContext);
            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toContain('Command timed out');
        }), 30000); // 30s timeout
    });
    describe('file operations', () => {
        it('should read file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedReadFile.mockResolvedValue('file content');
            const result = yield ToolUseSkill_1.ToolUseSkill.execute({ type: 'file-read', path: 'test.txt' }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output).toBe('file content');
        }));
        it('should handle missing file', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedExistsSync.mockReturnValue(false);
            const result = yield ToolUseSkill_1.ToolUseSkill.execute({ type: 'file-read', path: 'missing.txt' }, mockContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('File not found');
        }));
    });
    describe('validation', () => {
        it('should require type parameter', () => {
            if (!ToolUseSkill_1.ToolUseSkill.validate) {
                fail('validate method is undefined');
            }
            const validation = ToolUseSkill_1.ToolUseSkill.validate({});
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Type parameter is required');
        });
        it('should validate command operations', () => {
            if (!ToolUseSkill_1.ToolUseSkill.validate) {
                fail('validate method is undefined');
            }
            const validation = ToolUseSkill_1.ToolUseSkill.validate({ type: 'command' });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Command is required for command type');
        });
        it('should validate file operations', () => {
            if (!ToolUseSkill_1.ToolUseSkill.validate) {
                fail('validate method is undefined');
            }
            const validation = ToolUseSkill_1.ToolUseSkill.validate({ type: 'file-read' });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Path is required for file operations');
        });
    });
});
//# sourceMappingURL=ToolUseSkill.test.js.map