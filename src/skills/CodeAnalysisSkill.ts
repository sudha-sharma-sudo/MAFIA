import * as vscode from 'vscode';
import * as ts from 'typescript';

interface SkillDefinition {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description: string;
    default?: any;
  }>;
  execute: (params: any) => Promise<any>;
}

const CodeAnalysisSkill: SkillDefinition = {
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
  execute: async (params: { code: string, language?: string }) => {
    const issues = [];
    const metrics: Record<string, number> = {};
    
    try {
      // TypeScript specific analysis
      if (params.language === 'typescript') {
        const sourceFile = ts.createSourceFile(
          'temp.ts', 
          params.code, 
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
      if (params.code.includes('TODO')) issues.push('Contains TODO comments');
      if (params.code.includes('console.')) issues.push('Contains console statements');
      
      return {
        issues,
        metrics: {
          length: params.code.length,
          complexity: issues.length,
          ...metrics
        }
      };
    } catch (error) {
      vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        issues: [],
        metrics: {}
      };
    }
  }
};

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

export default CodeAnalysisSkill;