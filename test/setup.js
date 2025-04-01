// Setup test environment
process.env.NODE_ENV = 'test';

// Use our centralized vscode mock
const vscode = require('./mocks/vscode');
global.vscode = vscode;

// Configure Jest mocks
jest.mock('vscode', () => vscode, { virtual: true });

// Mock console for test verification
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Initialize any other test globals
global.performance = {
  now: () => Date.now()
};
