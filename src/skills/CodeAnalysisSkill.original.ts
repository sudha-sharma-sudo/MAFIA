import { SkillDefinition } from '../core/types';

const CodeAnalysisSkill: SkillDefinition = {
  name: 'code-analysis',
  description: 'Analyzes code for potential issues',
  parameters: {
    code: {
      type: 'string', 
      required: true,
      description: 'The code to analyze'
    }
  },
  execute: async (params: unknown) => {
    const { code } = params as { code: string };
    const startTime = Date.now();
    const issues = [];
    
    if (code.includes('TODO')) {
      issues.push('Contains TODO comments');
    }
    if (code.length > 100) {
      issues.push('Code is too long (over 100 chars)');
    }
    if (!code.includes('return')) {
      issues.push('Function may be missing return statement');
    }

    return {
      output: issues.join('\n'),
      success: true,
      metrics: {
        duration: Date.now() - startTime,
      length: code.length,
        complexity: issues.length
      }
    };
  }
};

export default CodeAnalysisSkill;