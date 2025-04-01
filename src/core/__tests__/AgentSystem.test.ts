import { MAFIAAgent } from '../AgentSystem';
import { KnowledgeGraph } from '../KnowledgeGraph';
import { EnhancedSkillRegistry } from '../SkillRegistry';
import type { AgentTask } from '../types';

describe('MAFIAAgent', () => {
  let agent: MAFIAAgent;
  const mockTask: AgentTask = {
    id: 'test-task',
    type: 'TEST_TASK',
    parameters: { testParam: 'value' },
    priority: 1,
    critical: true // Mark as critical to trigger promise rejection
  };

  beforeEach(() => {
    agent = new MAFIAAgent();
  });

  test('should initialize with empty state', () => {
    expect(agent).toBeInstanceOf(MAFIAAgent);
    expect(agent['complexityScore']).toBe(0);
    expect(agent['activeTasks'].size).toBe(0);
    expect(agent['taskQueue'].length).toBe(0);
  });

  test('should calculate task complexity', () => {
    const complexity = agent['calculateComplexity'](mockTask);
    expect(complexity).toBeGreaterThan(0);
    expect(complexity).toBeLessThanOrEqual(100);
  });

  test('should classify errors correctly', () => {
    const timeoutError = new Error('API timeout');
    const validationError = new Error('Validation failed');
    const unknownError = new Error('Unknown error');

    expect(agent['classifyError'](timeoutError).type).toBe('TIMEOUT');
    expect(agent['classifyError'](validationError).type).toBe('VALIDATION');
    expect(agent['classifyError'](unknownError).type).toBe('UNKNOWN');
  });

  test('should execute tasks and return results', async () => {
    const mockExecuteSkill = jest.fn().mockResolvedValue({
      output: 'success',
      metrics: {}
    });
    jest.spyOn(agent['skillSet'], 'executeSkill').mockImplementation(mockExecuteSkill);

    const result = await agent.executeTask(mockTask);
    expect(result.success).toBe(true);
    expect(result.output).toBe('success');
  });

  test('should handle task failures', async () => {
    const mockExecuteSkill = jest.fn(() => {
      throw new Error('API_TIMEOUT'); // Direct throw to ensure rejection
    });
    jest.spyOn(agent['skillSet'], 'executeSkill').mockImplementation(mockExecuteSkill);

    await expect(agent.executeTask(mockTask)).rejects.toThrow('API_TIMEOUT');
  });

  test('should manage task queue', async () => {
    const highPriorityTask = { ...mockTask, priority: 2 };
    await agent.queueTask(mockTask);
    await agent.queueTask(highPriorityTask);

    expect(agent['taskQueue'].length).toBe(2);
    expect(agent['taskQueue'][0].priority).toBe(2); // Higher priority first
  });

  test('should process queue in priority order', async () => {
    const executedTasks: string[] = [];
    const mockExecuteSkill = jest.fn().mockImplementation((type) => {
      executedTasks.push(type);
      return Promise.resolve({ output: 'success', metrics: {} });
    });
    jest.spyOn(agent['skillSet'], 'executeSkill').mockImplementation(mockExecuteSkill);

    await agent.queueTask({ ...mockTask, type: 'TASK1', priority: 1 });
    await agent.queueTask({ ...mockTask, type: 'TASK2', priority: 2 });
    await agent.processQueue();

    expect(executedTasks).toEqual(['TASK2', 'TASK1']);
  });
});