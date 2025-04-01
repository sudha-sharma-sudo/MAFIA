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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AgentSystem_1 = require("./core/AgentSystem");
const CodeAnalysisSkill_1 = __importDefault(require("./skills/CodeAnalysisSkill"));
function runDemo() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting MAFIA demo...');
        const agent = new AgentSystem_1.MAFIAAgent();
        console.log('Agent initialized');
        // Register skills
        // Create enhanced skill definition with required metadata
        const enhancedSkill = Object.assign(Object.assign({}, CodeAnalysisSkill_1.default), { parameters: {
                code: {
                    type: 'string',
                    required: true,
                    description: 'The code to analyze'
                }
            }, metadata: {
                name: CodeAnalysisSkill_1.default.name,
                version: '1.0.0',
                description: CodeAnalysisSkill_1.default.description,
                author: 'MAFIA Team',
                documentation: 'https://mafia-ai-docs.example.com'
            } });
        agent.skillSet.registerSkill(enhancedSkill);
        console.log('Registered CodeAnalysisSkill');
        // Execute sample task
        const task = {
            id: 'demo-analysis-1',
            type: 'analysis',
            parameters: {
                code: 'function test() { /* TODO: implement */ return 1; }'
            }
        };
        const result = yield agent.executeTask(task);
        console.log('Task completed. Results:', result);
    });
}
runDemo().catch(err => {
    console.error('Demo failed:', err);
    process.exit(1);
});
//# sourceMappingURL=demo.js.map