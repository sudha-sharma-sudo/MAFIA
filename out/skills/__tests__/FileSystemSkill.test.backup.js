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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Mock fs module
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        unlink: jest.fn(),
        readdir: jest.fn().mockImplementation(() => Promise.resolve([])),
        stat: jest.fn()
    },
    Dirent: class {
    }
}));
const mockedFsPromises = fs_1.promises;
describe('FileSystemSkill', () => {
    const mockContext = {
        requestId: 'test-request',
        agentId: 'test-agent',
        logger: {
            info: jest.fn(),
            error: jest.fn()
        },
        knowledgeGraph: {
            recordDecision: jest.fn(),
            findSimilarDecisions: jest.fn().mockReturnValue([]),
            linkDecisionToCode: jest.fn()
        }
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('file operations', () => {
        it('should read file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedFs.readFile.mockResolvedValue('file content');
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({
                operation: 'read',
                path: 'test.txt'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output).toBe('file content');
        }));
        it('should write file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!FileSystemSkill_1.FileSystemSkill.validate)
                return;
            const validation = FileSystemSkill_1.FileSystemSkill.validate({ operation: 'read' });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Path parameter is required');
        }));
        it('should require content for write operations', () => {
            if (!FileSystemSkill_1.FileSystemSkill.validate)
                return;
            const validation = FileSystemSkill_1.FileSystemSkill.validate({
                operation: 'write',
                path: 'test.txt'
            });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Content is required for write operations');
        });
        it('should validate operation types', () => {
            if (!FileSystemSkill_1.FileSystemSkill.validate)
                return;
            const validation = FileSystemSkill_1.FileSystemSkill.validate({
                operation: 'invalid',
                path: 'test.txt'
            });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Invalid operation type');
        });
    });
    describe('file operations', () => {
        it('should read file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedFs.readFile.mockResolvedValue('file content');
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({
                operation: 'read',
                path: 'test.txt'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output).toBe('file content');
            expect(mockedFsPromises.readFile).toHaveBeenCalledWith(path_1.default.resolve('test.txt'), 'utf-8');
        }));
        it('should write file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({
                operation: 'write',
                path: 'test.txt',
                content: 'new content'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(mockedFsPromises.writeFile).toHaveBeenCalledWith(path_1.default.resolve('test.txt'), 'new content', 'utf-8');
        }));
        it('should delete file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({
                operation: 'delete',
                path: 'test.txt'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(mockedFsPromises.unlink).toHaveBeenCalledWith(path_1.default.resolve('test.txt'));
        }));
        it('should list directory contents', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create proper Dirent mock objects
            const mockDirent1 = {
                name: 'file1.txt',
                isFile: () => true,
                isDirectory: () => false
            };
            const mockDirent2 = {
                name: 'file2.txt',
                isFile: () => true,
                isDirectory: () => false
            };
            mockedFsPromises.readdir.mockResolvedValue([mockDirent1, mockDirent2]);
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({
                operation: 'list',
                path: 'test_dir'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output).toEqual(['file1.txt', 'file2.txt']);
        }));
        it('should handle read errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedFsPromises.readFile.mockRejectedValue(new Error('File not found'));
            const result = yield FileSystemSkill_1.FileSystemSkill.execute({
                operation: 'read',
                path: 'missing.txt'
            }, mockContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('File not found');
        }));
    });
});
//# sourceMappingURL=FileSystemSkill.test.backup.js.map