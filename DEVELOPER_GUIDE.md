# MAFIA Developer Guide

## Error Handling Patterns

### Core Principles
1. **Timeout Errors** (`TIMEOUT` type, severity 3):
   - Always reject promises (throw)
   - Should halt execution flow
   - Example: API calls, external service timeouts

2. **Critical Task Errors** (severity >= 2 with `task.critical`):
   - Reject promises to stop execution
   - Use for mission-critical operations
   - Example: Payment processing, data persistence

3. **Non-Critical Errors** (severity 1):
   - Return error results with metrics
   - Allow operation continuation
   - Example: Validation warnings, optional features

### Implementation Example
```typescript
try {
  // Task execution
} catch (error) {
  const classification = classifyError(error);
  
  if (classification.type === 'TIMEOUT') {
    throw error; // Reject promise
  }
  
  if (classification.severity >= 2 && task.critical) {
    throw error; // Reject for critical tasks
  }
  
  return { // Return error result
    success: false,
    output: error.message,
    metrics: { /*...*/ }
  };
}
```

### Testing Guidelines

#### Testing Promise Rejection
```typescript
test('should reject on timeout', async () => {
  const mockFn = jest.fn(() => {
    throw new Error('API_TIMEOUT');
  });
  await expect(component(mockFn)).rejects.toThrow('API_TIMEOUT');
});
```

#### Testing Error Results  
```typescript
test('should return validation error', async () => {
  const mockFn = jest.fn(() => {
    throw new Error('Validation failed');
  });
  const result = await component(mockFn);
  expect(result.success).toBe(false);
  expect(result.metrics.errorType).toBe('VALIDATION');
});
```

## Tool-Specific Patterns

### Test Safety Patterns

**Null Checking**:
```typescript
it('should safely test methods', () => {
  if (!skill.method) return; // Safe guard
  const result = skill.method();
  expect(result).toBe(expected);
});
```

**Method Existence Verification**:
```typescript
it('should have required method', () => {
  expect(skill.method).toBeDefined();
});
```

**Validation Testing**:
```typescript
describe('validation', () => {
  it('should validate input', () => {
    if (!skill.validate) return;
    const validation = skill.validate(input);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Field required');
  });
});
```

**Implementation**:
```typescript
validate: (params: any) => {
  const errors: string[] = [];
  // Required field check
  if (!params.requiredField) {
    errors.push('Field is required');
  }
  // Value validation
  if (!validValues.includes(params.value)) {
    errors.push('Invalid value');
  }
  return { valid: errors.length === 0, errors };
}
```

**Testing**:
```typescript
it('should validate input', () => {
  const validation = skill.validate({});
  expect(validation.valid).toBe(false);
  expect(validation.errors).toContain('Field is required');
});
```

**Best Practices**:
```typescript
// 1. Null check pattern
it('should validate input', () => {
  if (!skill.validate) {
    throw new Error('validate method missing');
  }
  const validation = skill.validate(input);
  expect(validation.valid).toBe(false);
});

// 2. Error message testing
expect(validation.errors).toContain('Field is required');

// 3. Type validation
expect(validation.errors).toContain('Invalid type');
```

**Best Practices**:
```typescript
// 1. Mock puppeteer and page objects
const mockPage = {
  goto: jest.fn(),
  click: jest.fn(),
  type: jest.fn()
};
const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage)
};
jest.mock('puppeteer-core', () => ({
  launch: jest.fn().mockResolvedValue(mockBrowser)
}));

// 2. Test structure
it('should test browser action', async () => {
  // Arrange - setup mocks
  mockPage.goto.mockResolvedValue(null);
  
  // Act - execute
  const result = await skill.execute({ 
    action: 'navigate',
    url: 'https://example.com' 
  }, context);

  // Assert - verify
  expect(result.success).toBe(true);
  expect(mockPage.goto).toHaveBeenCalledWith('https://example.com');
});

// 3. Error handling
mockPage.goto.mockRejectedValue(new Error('Navigation failed'));
```

**Best Practices**:
```typescript
// 1. Mock implementation with callback
mockedExec.mockImplementation((cmd, options, callback) => {
  // Successful execution
  callback(null, { stdout: 'output', stderr: '' });
  
  // Error case
  // const err = new Error('Failed');
  // (err as any).code = 'ETIMEDOUT';
  // callback(err);
});

// 2. Test structure
it('should test command', async () => {
  // Arrange - setup mocks
  // Act - execute
  // Assert - verify
}, 30000); // Timeout

// 3. Error handling
interface CommandError extends Error {
  code?: string;
}
```

**Best Practices**:
```typescript
// 1. Use proper timeouts (30s+ for command tests)
jest.setTimeout(30000);

// 2. Simple mock implementations  
mockedExec.mockResolvedValue({ stdout: 'output' });

// 3. Error handling
const error = new Error('Failed');
(error as any).code = 'ETIMEDOUT'; 
mockedExec.mockRejectedValue(error);

// Failing command  
mockedExec.mockImplementation(() =>
  Promise.reject(new Error('Command failed'))
);

// Timeout handling
interface CommandError extends Error {
  code?: string; // 'ETIMEDOUT', etc
}
const error: CommandError = new Error('Timeout');
error.code = 'ETIMEDOUT';

try {
  const { stdout } = await execAsync(command);
} catch (error) {
  if ((error as CommandError).code === 'ETIMEDOUT') {
    // Handle timeout
  }
}
```

## Filesystem-Specific Patterns

### Error Handling
```typescript
interface FSError extends Error {
  code?: string; // 'ENOENT', 'EACCES', etc
}

// Handle filesystem errors
if (error.code === 'ENOENT') {
  // File not found handling
} else if (error.code === 'EACCES') {
  // Permission denied handling
}

## Best Practices
- Use consistent error types and severity levels
- Always include filesystem error codes
- Include detailed metrics in error results
- Document error handling behavior in interfaces
- Test both rejection and error result scenarios