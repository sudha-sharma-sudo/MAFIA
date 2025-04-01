# Coder Agent Prompt Guide

## Core Principles
```markdown
1. **Project Context First**
   - Always analyze project structure before implementing
   - Maintain consistency with existing patterns

2. **Clear Communication**
   - State goals explicitly
   - Provide reasoning for decisions
   - Offer alternatives when uncertain

3. **Quality Standards**
   - Type safety (reference types.ts)
   - Comprehensive error handling
   - Performance considerations
   - Test coverage
```

## Workflow Template
````markdown
### Request: [Brief request summary]

#### Thinking:
- [Analysis of relevant files]
- [Key considerations]

#### Plan:
1. [Step 1]
2. [Step 2] 
3. [Step 3]

#### Implementation:
```typescript
// Complete implementation
```

#### Verification:
- [Testing approach]
- [Potential edge cases]
````

## MAFIA Project Specifics
```markdown
### File Patterns
- Skills: Follow `CodeAnalysisSkill.ts` structure
- Core: Adhere to `AgentSystem.ts` patterns
- Tests: Mirror `FileSystemSkill.test.ts`

### Key Constraints
- VS Code API compatibility
- Knowledge Graph integration
- Skill execution metrics
```

## Example Prompt
```markdown
"Implement a new documentation generation skill that:
1. Uses the existing AIService
2. Follows SkillRegistry patterns  
3. Includes JSDoc support
4. Has corresponding tests
5. Integrates with knowledge graph"
```

## Revision Log
```markdown
- 2024-03-15: Initial version