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
const DocumentationSkill_1 = __importDefault(require("../skills/DocumentationSkill"));
describe('DocumentationSkill', () => {
    const mockContext = {
        requestId: 'test-request',
        agentId: 'test-agent',
        knowledgeGraph: {
            findSimilarDecisions: jest.fn().mockResolvedValue([]),
            recordDecision: jest.fn(),
            linkDecisionToCode: jest.fn()
        },
        logger: {
            info: jest.fn(),
            error: jest.fn()
        }
    };
    it('should generate markdown documentation', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const code = `function hello() { return 'world'; }`;
        const result = yield DocumentationSkill_1.default.execute({ code }, mockContext);
        expect(result.success).toBe(true);
        expect(result.output).toContain('# Code Documentation');
        expect(result.output).toContain(code);
        expect((_a = result.metrics) === null || _a === void 0 ? void 0 : _a.duration).toBeDefined();
    }));
    it('should generate HTML documentation', () => __awaiter(void 0, void 0, void 0, function* () {
        const code = `function hello() { return 'world'; }`;
        const result = yield DocumentationSkill_1.default.execute({ code, format: 'html' }, mockContext);
        expect(result.success).toBe(true);
        expect(result.output).toContain('<!DOCTYPE html>');
        expect(result.output).toContain('<');
    }));
    it('should validate parameters', () => {
        var _a, _b;
        const validation = (_a = DocumentationSkill_1.default.validate) === null || _a === void 0 ? void 0 : _a.call(DocumentationSkill_1.default, {});
        expect(validation === null || validation === void 0 ? void 0 : validation.valid).toBe(false);
        expect(validation === null || validation === void 0 ? void 0 : validation.errors).toContain('Missing required parameter: code');
        const validValidation = (_b = DocumentationSkill_1.default.validate) === null || _b === void 0 ? void 0 : _b.call(DocumentationSkill_1.default, { code: 'test' });
        expect(validValidation === null || validValidation === void 0 ? void 0 : validValidation.valid).toBe(true);
    });
    it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockErrorContext = Object.assign(Object.assign({}, mockContext), { knowledgeGraph: {
                findSimilarDecisions: jest.fn().mockRejectedValue(new Error('Test error'))
            } });
        const result = yield DocumentationSkill_1.default.execute({ code: 'test', format: 'invalid' }, mockErrorContext);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Test error');
        expect(mockErrorContext.logger.error).toHaveBeenCalled();
    }));
    it('should respect timeout', () => __awaiter(void 0, void 0, void 0, function* () {
        const originalExecute = DocumentationSkill_1.default.execute;
        DocumentationSkill_1.default.execute = jest.fn(() => new Promise((_, reject) => setTimeout(() => reject(new Error('API_TIMEOUT')), DocumentationSkill_1.default.timeout + 100)));
        yield expect(DocumentationSkill_1.default.execute({ code: 'test' }, mockContext))
            .rejects.toThrow('API_TIMEOUT');
        DocumentationSkill_1.default.execute = originalExecute;
    }));
});
//# sourceMappingURL=DocumentationSkill.test.js.map