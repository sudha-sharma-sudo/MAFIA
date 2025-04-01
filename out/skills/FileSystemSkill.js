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
exports.FileSystemSkill = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const FileSystemParameters = {
    operation: {
        type: 'string',
        enum: ['read', 'write', 'delete', 'list', 'stat'],
        required: true,
        description: 'File system operation to perform'
    },
    path: {
        type: 'string',
        required: true,
        description: 'File or directory path'
    },
    content: {
        type: 'string',
        required: false,
        description: 'Content for write operations'
    },
    recursive: {
        type: 'boolean',
        required: false,
        description: 'Perform operation recursively',
        default: false
    }
};
exports.FileSystemSkill = {
    metadata: {
        name: 'file-system',
        version: '1.0.0',
        description: 'Perform file system operations',
        dependencies: [],
        parameters: FileSystemParameters
    },
    validate(params) {
        const errors = [];
        const validOperations = ['read', 'write', 'delete', 'list', 'stat'];
        if (!params.operation) {
            errors.push('Operation parameter is required');
        }
        else if (!validOperations.includes(params.operation)) {
            errors.push('Invalid operation type');
        }
        if (!params.path) {
            errors.push('Path parameter is required');
        }
        if (params.operation === 'write' && !params.content) {
            errors.push('Content is required for write operations');
        }
        return { valid: errors.length === 0, errors };
    },
    execute(params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            try {
                let output;
                const fullPath = path_1.default.resolve(params.path);
                switch (params.operation) {
                    case 'read':
                        output = yield fs_1.promises.readFile(fullPath, 'utf-8');
                        break;
                    case 'write':
                        yield fs_1.promises.writeFile(fullPath, params.content);
                        output = { path: fullPath, status: 'written' };
                        break;
                    case 'delete':
                        yield fs_1.promises.unlink(fullPath);
                        output = { path: fullPath, status: 'deleted' };
                        break;
                    case 'list':
                        output = yield fs_1.promises.readdir(fullPath);
                        break;
                    case 'stat':
                        output = yield fs_1.promises.stat(fullPath);
                        break;
                }
                return {
                    success: true,
                    output,
                    metrics: {
                        duration: Date.now() - startTime,
                        memoryUsage: process.memoryUsage().heapUsed
                    }
                };
            }
            catch (error) {
                return {
                    success: false,
                    output: null,
                    error: error instanceof Error ? error.message : String(error),
                    metrics: {
                        duration: Date.now() - startTime
                    }
                };
            }
        });
    }
};
//# sourceMappingURL=FileSystemSkill.js.map