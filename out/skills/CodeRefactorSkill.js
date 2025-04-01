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
const AIService_1 = require("../ai/AIService");
// Create AIService instance with empty config since API key will be set by extension
const aiService = new AIService_1.AIService({ apiKey: '' });
const CodeRefactorSkill = {
    name: 'code-refactor',
    description: 'Refactors code using AI suggestions',
    parameters: {
        code: {
            type: 'string',
            required: true,
            description: 'The code to refactor'
        },
        refactorType: {
            type: 'string',
            required: false,
            description: 'Type of refactoring (e.g., "optimize", "clean", "simplify")'
        }
    },
    execute: (params) => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = Date.now();
        if (!params.code) {
            throw new Error('Code parameter is required');
        }
        const response = yield aiService.refactorCode(params.code, params.refactorType);
        return {
            success: true,
            output: response,
            metrics: {
                duration: Date.now() - startTime,
                originalLength: params.code.length,
                refactoredLength: response.length
            }
        };
    })
};
exports.default = CodeRefactorSkill;
//# sourceMappingURL=CodeRefactorSkill.js.map