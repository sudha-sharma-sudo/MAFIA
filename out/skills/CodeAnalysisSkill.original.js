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
const CodeAnalysisSkill = {
    name: 'code-analysis',
    description: 'Analyzes code for potential issues',
    parameters: {
        code: {
            type: 'string',
            required: true,
            description: 'The code to analyze'
        }
    },
    execute: (params) => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = Date.now();
        const issues = [];
        if (params.code.includes('TODO')) {
            issues.push('Contains TODO comments');
        }
        if (params.code.length > 100) {
            issues.push('Code is too long (over 100 chars)');
        }
        if (!params.code.includes('return')) {
            issues.push('Function may be missing return statement');
        }
        return {
            output: issues.join('\n'),
            success: true,
            metrics: {
                duration: Date.now() - startTime,
                length: params.code.length,
                complexity: issues.length
            }
        };
    })
};
exports.default = CodeAnalysisSkill;
//# sourceMappingURL=CodeAnalysisSkill.original.js.map