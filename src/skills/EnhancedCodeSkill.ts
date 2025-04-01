import * as vscode from 'vscode';
import * as ts from 'typescript';
import { AIService } from '../ai/AIService';

interface SkillDefinition {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description: string;
    default?: any;
    enum?: string[];
  }>;
  execute: (params: any) => Promise<any>;
}

const aiService = new AIService();

const EnhancedCodeSkill: SkillDefinition = {
  name: 'enhanced-code',
  description: 'Combined code analysis and refactoring with AST processing',
  parameters: {
    code: {
      type: 'string',
      required: true,
      description: 'The code to analyze/refactor'
    },
    language: {
      type: 'string',
      required: false,
      description: 'Programming language (default: typescript)',
      default: 'typescript'
    },
    action: {
      type: 'string',
      required: true,
      description: 'Action to perform (analyze|refactor|both)',
      enum: ['analyze', 'refactor', 'both']
    },
    refactorType: {
      type: 'string',
      required: false,
      description: 'Type of refactoring (optimize|clean|simplify|secure)',
      default: 'optimize'
    }
  },

  execute: async (params: { 
    code: string,
    language?: string,
    action: string,
    refactorType?: string
  }) => {
    // Validate input
    if (!params.code) throw new Error('Code parameter is required');
    
    // AST-based analysis
    const analysis = params.action !== 'refactor' ? 
      await analyzeCode(params.code, params.language) : 
      { issues: [], metrics: {} };

    // AI-based refactoring
    const refactored = params.action !== 'analyze' ?
      await aiService.refactorCode(params.code, params.refactorType) :
      params.code;

    return {
      analysis,
      refactored,
      metrics: {
        originalLength: params.code.length,
        refactoredLength: refactored.length,
        ...analysis.metrics
      }
    };
  }
};

async function analyzeCode(code: string, language = 'typescript') {
  const issues = [];
  const metrics: Record<string, number> = {};
  
  try {
    // TypeScript specific analysis
    if (language === 'typescript') {
      const sourceFile = ts.createSourceFile(
        'temp.ts', 
        code, 
        ts.ScriptTarget.Latest,
        true
      );

      // Calculate complexity metrics
      metrics.complexity = calculateCyclomaticComplexity(sourceFile);
      metrics.functions = countFunctions(sourceFile);
      metrics.imports = countImports(sourceFile);

      // Find code smells
      ts.forEachChild(sourceFile, node => {
        if (ts.isFunctionDeclaration(node)) {
          if (node.parameters.length > 4) {
            issues.push(`Function ${node.name?.text || 'anonymous'} has too many parameters`);
          }
        }
      });
    }

    // Generic checks
    if (code.includes('TODO')) issues.push('Contains TODO comments');
    if (code.includes('console.')) issues.push('Contains console statements');
    
    return { issues, metrics };
  } catch (error) {
    vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    return { issues: [], metrics: {} };
  }
}

// Helper functions for AST analysis
function calculateCyclomaticComplexity(sourceFile: ts.SourceFile): number {
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

function countFunctions(sourceFile: ts.SourceFile): number {
  let count = 0;
  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) count++;
  });
  return count;
}

function countImports(sourceFile: ts.SourceFile): number {
  let count = 0;
  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node)) count++;
  });
  return count;
}

export default EnhancedCodeSkill;