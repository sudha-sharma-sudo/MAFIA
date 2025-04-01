import { SkillDefinition } from '../core/types';
import { AIService } from '../ai/AIService';

// Create AIService instance with empty config since API key will be set by extension
const aiService = new AIService({ apiKey: '' });

const CodeRefactorSkill: SkillDefinition = {
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
  execute: async (params: unknown) => {
    const { code, refactorType } = params as { code: string, refactorType?: string };
    const startTime = Date.now();
    if (!code) {
      throw new Error('Code parameter is required');
    }
    const response = await aiService.refactorCode(code, refactorType);
    return { 
      success: true,
      output: response,
      metrics: {
        duration: Date.now() - startTime,
      originalLength: code.length,
        refactoredLength: response.length
      }
    };
  }
};

export default CodeRefactorSkill;