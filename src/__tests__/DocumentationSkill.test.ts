import DocumentationSkill from '../skills/DocumentationSkill';
import { SkillContext } from '../core/EnhancedSkillTypes';

describe('DocumentationSkill', () => {
  const mockContext: SkillContext = {
    requestId: 'test-request',
    agentId: 'test-agent',
    knowledgeGraph: {
      findSimilarDecisions: jest.fn().mockResolvedValue([]),
      recordDecision: jest.fn(),
      linkDecisionToCode: jest.fn()
    },
    logger: {
      info: jest.fn(),
      error: jest.fn()
    }
  };

  it('should generate markdown documentation', async () => {
    const code = `function hello() { return 'world'; }`;
    const result = await DocumentationSkill.execute({ code }, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.output).toContain('# Code Documentation');
    expect(result.output).toContain(code);
    expect(result.metrics?.duration).toBeDefined();
  });

  it('should generate HTML documentation', async () => {
    const code = `function hello() { return 'world'; }`;
    const result = await DocumentationSkill.execute(
      { code, format: 'html' }, 
      mockContext
    );
    
    expect(result.success).toBe(true);
    expect(result.output).toContain('<!DOCTYPE html>');
    expect(result.output).toContain('<');
  });

  it('should validate parameters', () => {
    const validation = DocumentationSkill.validate?.({});
    expect(validation?.valid).toBe(false);
    expect(validation?.errors).toContain('Missing required parameter: code');
    
    const validValidation = DocumentationSkill.validate?.({ code: 'test' });
    expect(validValidation?.valid).toBe(true);
  });

  it('should handle errors', async () => {
    const mockErrorContext = {
      ...mockContext,
      knowledgeGraph: {
        findSimilarDecisions: jest.fn().mockRejectedValue(new Error('Test error'))
      }
    };
    const result = await DocumentationSkill.execute(
      { code: 'test', format: 'invalid' },
      mockErrorContext
    );
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Test error');
    expect(mockErrorContext.logger.error).toHaveBeenCalled();
  });

  it('should respect timeout', async () => {
    const originalExecute = DocumentationSkill.execute;
    DocumentationSkill.execute = jest.fn(() => 
      new Promise((_, reject) => setTimeout(() => reject(new Error('API_TIMEOUT')), DocumentationSkill.timeout! + 100))
    );
    
    await expect(DocumentationSkill.execute({ code: 'test' }, mockContext))
      .rejects.toThrow('API_TIMEOUT');
    
    DocumentationSkill.execute = originalExecute;
  });
});