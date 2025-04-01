"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const vscode = __importStar(require("vscode"));
const ts = __importStar(require("typescript"));
const CodeAnalysisSkill = {
    name: 'code-analysis',
    description: 'Enhanced code analysis with AST processing',
    parameters: {
        code: {
            type: 'string',
            required: true,
            description: 'The code to analyze'
        },
        language: {
            type: 'string',
            required: false,
            description: 'Programming language (default: typescript)',
            default: 'typescript'
        }
    },
    execute: (params) => __awaiter(void 0, void 0, void 0, function* () {
        const issues = [];
        const metrics = {};
        try {
            // TypeScript specific analysis
            if (params.language === 'typescript') {
                const sourceFile = ts.createSourceFile('temp.ts', params.code, ts.ScriptTarget.Latest, true);
                // Calculate complexity metrics
                metrics.complexity = calculateCyclomaticComplexity(sourceFile);
                metrics.functions = countFunctions(sourceFile);
                metrics.imports = countImports(sourceFile);
                // Find code smells
                ts.forEachChild(sourceFile, node => {
                    var _a;
                    if (ts.isFunctionDeclaration(node)) {
                        if (node.parameters.length > 4) {
                            issues.push(`Function ${((_a = node.name) === null || _a === void 0 ? void 0 : _a.text) || 'anonymous'} has too many parameters`);
                        }
                    }
                });
            }
            // Generic checks
            if (params.code.includes('TODO'))
                issues.push('Contains TODO comments');
            if (params.code.includes('console.'))
                issues.push('Contains console statements');
            return {
                issues,
                metrics: Object.assign({ length: params.code.length, complexity: issues.length }, metrics)
            };
        }
        catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
            return {
                issues: [],
                metrics: {}
            };
        }
    })
};
// Helper functions for AST analysis
function calculateCyclomaticComplexity(sourceFile) {
    let complexity = 0;
    ts.forEachChild(sourceFile, node => {
        if (ts.isIfStatement(node) ||
            ts.isForStatement(node) ||
            ts.isWhileStatement(node) ||
            ts.isCaseClause(node)) {
            complexity++;
        }
    });
    return complexity;
}
function countFunctions(sourceFile) {
    let count = 0;
    ts.forEachChild(sourceFile, node => {
        if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node))
            count++;
    });
    return count;
}
function countImports(sourceFile) {
    let count = 0;
    ts.forEachChild(sourceFile, node => {
        if (ts.isImportDeclaration(node))
            count++;
    });
    return count;
}
exports.default = CodeAnalysisSkill;
//# sourceMappingURL=CodeAnalysisSkill.js.map