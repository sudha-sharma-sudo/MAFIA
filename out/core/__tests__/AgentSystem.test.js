"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AgentSystem_1 = require("../AgentSystem");
describe('MAFIAAgent', () => {
    let agent;
    const mockTask = {
        id: 'test-task',
        type: 'TEST_TASK',
        parameters: { testParam: 'value' },
        priority: 1,
        critical: true // Mark as critical to trigger promise rejection
    };
    beforeEach(() => {
        agent = new AgentSystem_1.MAFIAAgent();
    });
    test('should initialize with empty state', () => {
        expect(agent).toBeInstanceOf(AgentSystem_1.MAFIAAgent);
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
    test('should execute tasks and return results', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockExecuteSkill = jest.fn().mockResolvedValue({
            output: 'success',
            metrics: {}
        });
        jest.spyOn(agent['skillSet'], 'executeSkill').mockImplementation(mockExecuteSkill);
        const result = yield agent.executeTask(mockTask);
        expect(result.success).toBe(true);
        expect(result.output).toBe('success');
    }));
    test('should handle task failures', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockExecuteSkill = jest.fn(() => {
            throw new Error('API_TIMEOUT'); // Direct throw to ensure rejection
        });
        jest.spyOn(agent['skillSet'], 'executeSkill').mockImplementation(mockExecuteSkill);
        yield expect(agent.executeTask(mockTask)).rejects.toThrow('API_TIMEOUT');
    }));
    test('should manage task queue', () => __awaiter(void 0, void 0, void 0, function* () {
        const highPriorityTask = Object.assign(Object.assign({}, mockTask), { priority: 2 });
        yield agent.queueTask(mockTask);
        yield agent.queueTask(highPriorityTask);
        expect(agent['taskQueue'].length).toBe(2);
        expect(agent['taskQueue'][0].priority).toBe(2); // Higher priority first
    }));
    test('should process queue in priority order', () => __awaiter(void 0, void 0, void 0, function* () {
        const executedTasks = [];
        const mockExecuteSkill = jest.fn().mockImplementation((type) => {
            executedTasks.push(type);
            return Promise.resolve({ output: 'success', metrics: {} });
        });
        jest.spyOn(agent['skillSet'], 'executeSkill').mockImplementation(mockExecuteSkill);
        yield agent.queueTask(Object.assign(Object.assign({}, mockTask), { type: 'TASK1', priority: 1 }));
        yield agent.queueTask(Object.assign(Object.assign({}, mockTask), { type: 'TASK2', priority: 2 }));
        yield agent.processQueue();
        expect(executedTasks).toEqual(['TASK2', 'TASK1']);
    }));
});
//# sourceMappingURL=AgentSystem.test.js.map