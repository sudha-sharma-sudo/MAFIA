import { jest } from '@jest/globals';

const vscode = {
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn()
  },
  commands: {
    registerCommand: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn()
  },
  env: {
    machineId: 'test-machine-id'
  }
};

export default vscode;