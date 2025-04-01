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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystemSkill_1 = require("../FileSystemSkill");
const promises_1 = __importDefault(require("fs/promises"));
describe('FileSystemSkill', () => {
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
    });
    describe('read operation', () => {
        it('should successfully read file', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(promises_1.default, 'readFile').mockResolvedValue('file content');
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({ operation: 'read', path: 'test.txt' }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output).toBe('file content');
        }));
        it('should handle ENOENT errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('File not found');
            error.code = 'ENOENT';
            jest.spyOn(promises_1.default, 'readFile').mockRejectedValue(error);
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({ operation: 'read', path: 'missing.txt' }, mockContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('File not found');
            expect(result.metrics).toHaveProperty('duration');
        }));
        it('should handle permission errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Permission denied');
            error.code = 'EACCES';
            jest.spyOn(promises_1.default, 'readFile').mockRejectedValue(error);
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({ operation: 'read', path: 'restricted.txt' }, mockContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Permission denied');
        }));
    });
    describe('write operation', () => {
        it('should successfully write file', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(promises_1.default, 'writeFile').mockResolvedValue();
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({ operation: 'write', path: 'output.txt', content: 'data' }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output.status).toBe('written');
        }));
        it('should handle directory creation errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('No such directory');
            error.code = 'ENOENT';
            jest.spyOn(promises_1.default, 'writeFile').mockRejectedValue(error);
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({ operation: 'write', path: 'missing/output.txt', content: 'data' }, mockContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('No such directory');
        }));
    });
    describe('validation', () => {
        it('should reject missing operation', () => {
            if (!FileSystemSkill_1.FileSystemSkill.validate) {
                fail('validate method is undefined');
            }
            const validation = FileSystemSkill_1.FileSystemSkill.validate({ path: 'test.txt' });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Operation parameter is required');
        });
        it('should reject missing path', () => {
            if (!FileSystemSkill_1.FileSystemSkill.validate) {
                fail('validate method is undefined');
            }
            const validation = FileSystemSkill_1.FileSystemSkill.validate({ operation: 'read' });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Path parameter is required');
        });
        it('should reject write without content', () => {
            if (!FileSystemSkill_1.FileSystemSkill.validate) {
                fail('validate method is undefined');
            }
            const validation = FileSystemSkill_1.FileSystemSkill.validate({
                operation: 'write',
                path: 'test.txt'
            });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Content is required for write operations');
        });
    });
});
//# sourceMappingURL=FileSystemSkill.test.js.map