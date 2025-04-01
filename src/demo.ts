import { MAFIAAgent } from './core/AgentSystem';
import { AgentTask } from './core/types';
import CodeAnalysisSkill from './skills/CodeAnalysisSkill';

async function runDemo() {
  console.log('Starting MAFIA demo...');
  
  const agent = new MAFIAAgent();
  console.log('Agent initialized');

  // Register skills
  // Create enhanced skill definition with required metadata
  const enhancedSkill = {
    ...CodeAnalysisSkill,
    parameters: {
      code: {
        type: 'string' as const,
        required: true,
        description: 'The code to analyze'
      }
    },
    metadata: {
      name: CodeAnalysisSkill.name,
      version: '1.0.0',
      description: CodeAnalysisSkill.description,
      author: 'MAFIA Team',
      documentation: 'https://mafia-ai-docs.example.com'
    }
  };
  agent.skillSet.registerSkill(enhancedSkill);
  console.log('Registered CodeAnalysisSkill');

  // Execute sample task
  const task: AgentTask = {
    id: 'demo-analysis-1',
    type: 'analysis',
    parameters: {
      code: 'function test() { /* TODO: implement */ return 1; }'
    }
  };
  const result = await agent.executeTask(task);

  console.log('Task completed. Results:', result);
}

runDemo().catch(err => {
  console.error('Demo failed:', err);
  process.exit(1);
});