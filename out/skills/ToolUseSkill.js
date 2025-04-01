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
exports.ToolUseSkill = void 0;
const ToolUseParameters = {
    type: {
        type: 'string',
        enum: ['command', 'file-read', 'file-write', 'browser'],
        required: true,
        description: 'Type of tool operation'
    },
    command: {
        type: 'string',
        required: false,
        description: 'Command to execute'
    },
    path: {
        type: 'string',
        required: false,
        description: 'File path for file operations'
    },
    content: {
        type: 'string',
        required: false,
        description: 'Content for file write operations'
    },
    url: {
        type: 'string',
        required: false,
        description: 'URL for browser operations'
    },
    timeout: {
        type: 'number',
        required: false,
        description: 'Operation timeout in ms',
        default: 30000
    }
};
const child_process_1 = require("child_process");
const util_1 = require("util");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.ToolUseSkill = {
    metadata: {
        name: 'tool-use',
        version: '1.0.0',
        description: 'Execute system tools and operations',
        dependencies: [],
        parameters: ToolUseParameters
    },
    validate(params) {
        if (!params.type) {
            return { valid: false, errors: ['Type parameter is required'] };
        }
        const errors = [];
        if (params.type === 'command' && !params.command) {
            errors.push('Command is required for command type');
        }
        if ((params.type === 'file-read' || params.type === 'file-write') && !params.path) {
            errors.push('Path is required for file operations');
        }
        if (params.type === 'file-write' && !params.content) {
            errors.push('Content is required for file write');
        }
        if (params.type === 'browser' && !params.url) {
            errors.push('URL is required for browser operations');
        }
        return { valid: errors.length === 0, errors };
    },
    execute(params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let output;
                const startTime = Date.now();
                switch (params.type) {
                    case 'command':
                        const { stdout, stderr } = yield execAsync(params.command, {
                            timeout: params.timeout
                        });
                        output = { stdout, stderr };
                        break;
                    case 'file-read':
                        if (!(0, fs_1.existsSync)(params.path)) {
                            throw new Error(`File not found: ${params.path}`);
                        }
                        output = yield (0, promises_1.readFile)(params.path, 'utf-8');
                        break;
                    case 'file-write':
                        yield (0, promises_1.writeFile)(params.path, params.content);
                        output = { success: true, path: params.path };
                        break;
                    case 'browser':
                        // Browser operations will be handled by BrowserAutomationSkill
                        throw new Error('Browser operations require BrowserAutomationSkill');
                    default:
                        throw new Error(`Unknown tool type: ${params.type}`);
                }
                return {
                    success: true,
                    output,
                    metrics: {
                        duration: Date.now() - startTime,
                        // Additional metrics can be added under memoryUsage or cpuUsage
                        // to match the SkillExecutionResult type
                    }
                };
            }
            catch (error) {
                return {
                    success: false,
                    output: null,
                    error: error instanceof Error ? error.message : String(error),
                    metrics: {
                        duration: 0
                    }
                };
            }
        });
    }
};
//# sourceMappingURL=ToolUseSkill.js.map