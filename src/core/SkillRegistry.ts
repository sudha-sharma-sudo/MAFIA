import { EnhancedSkillDefinition, SkillExecutionResult, SkillContext } from './EnhancedSkillTypes';
import { EventEmitter } from 'events';

export class EnhancedSkillRegistry {
  private skills: Map<string, EnhancedSkillDefinition> = new Map();
  private events = new EventEmitter();

  registerSkill(skill: EnhancedSkillDefinition): void {
    if (this.skills.has(skill.metadata.name)) {
      throw new Error(`Skill ${skill.metadata.name} is already registered`);
    }
    
    // Validate skill dependencies
    if (skill.metadata.dependencies) {
      for (const dep of skill.metadata.dependencies) {
        if (!this.skills.has(dep)) {
          throw new Error(`Missing dependency: ${dep} for skill ${skill.metadata.name}`);
        }
      }
    }

    this.skills.set(skill.metadata.name, skill);
    this.events.emit('skillRegistered', skill.metadata.name);
  }

  async executeSkill(
    name: string, 
    params: any,
    context?: SkillContext
  ): Promise<SkillExecutionResult> {
    const skill = this.getSkill(name);
    if (!skill) {
      throw new Error(`Skill ${name} not found`);
    }

    // Validate parameters
    if (skill.validate) {
      const validation = skill.validate(params);
      if (!validation.valid) {
        return {
          success: false,
          output: null,
          error: `Validation failed: ${validation.errors?.join(', ')}`
        };
      }
    }

    // Execute with timeout if specified
    if (skill.timeout) {
      return Promise.race([
        skill.execute(params, context),
        new Promise<SkillExecutionResult>((_, reject) => 
          setTimeout(() => reject(new Error(`Skill timeout after ${skill.timeout}ms`)), skill.timeout)
        )
      ]);
    }

    return skill.execute(params, context);
  }

  getSkill(name: string): EnhancedSkillDefinition | undefined {
    return this.skills.get(name);
  }

  listSkills(): string[] {
    return Array.from(this.skills.keys());
  }

  getSkillVersion(name: string): string | undefined {
    return this.skills.get(name)?.metadata.version;
  }

  onSkillRegistered(callback: (skillName: string) => void): void {
    this.events.on('skillRegistered', callback);
  }
}
