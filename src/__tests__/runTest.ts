import * as assert from 'assert';
// Use the globally mocked vscode
declare const vscode: any;
import { AIService } from '../ai/AIService';

describe('Extension Tests', () => {
    it('AIService initialization', () => {
        const aiService = new AIService({ apiKey: 'test' });
        assert.ok(aiService, 'AIService should initialize');
    });

    it('Commands registration', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('blackboxai.showAssistant'), 'showAssistant command should be registered');
        assert.ok(commands.includes('blackboxai.analyzeCode'), 'analyzeCode command should be registered');
        assert.ok(commands.includes('blackboxai.generateDocs'), 'generateDocs command should be registered');
    });
});