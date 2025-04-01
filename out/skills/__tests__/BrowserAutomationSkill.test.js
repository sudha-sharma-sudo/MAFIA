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
const BrowserAutomationSkill_1 = require("../BrowserAutomationSkill");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
// Mock puppeteer
jest.mock('puppeteer-core', () => ({
    launch: jest.fn(),
}));
const mockedPuppeteer = puppeteer_core_1.default;
describe('BrowserAutomationSkill', () => {
    const mockContext = {
        requestId: 'test-request',
        agentId: 'test-agent',
        knowledgeGraph: {
            recordDecision: jest.fn(),
            findSimilarDecisions: jest.fn().mockReturnValue([]),
            linkDecisionToCode: jest.fn()
        },
        logger: {
            info: jest.fn(),
            error: jest.fn()
        }
    };
    const mockPage = {
        newPage: jest.fn(),
        goto: jest.fn(),
        click: jest.fn(),
        type: jest.fn(),
        screenshot: jest.fn(),
        setViewport: jest.fn(),
        close: jest.fn()
    };
    const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn()
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockedPuppeteer.launch.mockResolvedValue(mockBrowser);
    });
    describe('launch action', () => {
        it('should launch browser successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield BrowserAutomationSkill_1.BrowserAutomationSkill.execute({
                action: 'launch',
                viewport: { width: 1024, height: 768 }
            }, mockContext);
            expect(result.success).toBe(true);
            expect(result.output).toEqual({ status: 'browser_launched' });
            expect(mockPage.setViewport).toHaveBeenCalledWith({ width: 1024, height: 768 });
        }));
    });
    describe('navigation', () => {
        it('should navigate to URL successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockContext.artifacts = { page: mockPage };
            mockPage.goto.mockResolvedValue(null);
            const result = yield BrowserAutomationSkill_1.BrowserAutomationSkill.execute({
                action: 'navigate',
                url: 'https://example.com',
                timeout: 30000
            }, mockContext);
            expect(result.success).toBe(true);
            expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', { timeout: 30000 });
        }));
        it('should handle navigation errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockContext.artifacts = { page: mockPage };
            mockPage.goto.mockRejectedValue(new Error('Navigation timeout'));
            const result = yield BrowserAutomationSkill_1.BrowserAutomationSkill.execute({
                action: 'navigate',
                url: 'https://example.com'
            }, mockContext);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Navigation timeout');
        }));
    });
    describe('element interaction', () => {
        beforeEach(() => {
            mockContext.artifacts = { page: mockPage };
        });
        it('should click element successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield BrowserAutomationSkill_1.BrowserAutomationSkill.execute({
                action: 'click',
                selector: '#submit'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(mockPage.click).toHaveBeenCalledWith('#submit', { timeout: undefined });
        }));
        it('should type text successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield BrowserAutomationSkill_1.BrowserAutomationSkill.execute({
                action: 'type',
                selector: '#search',
                text: 'test query'
            }, mockContext);
            expect(result.success).toBe(true);
            expect(mockPage.type).toHaveBeenCalledWith('#search', 'test query', { timeout: undefined });
        }));
    });
    describe('validation', () => {
        it('should require action parameter', () => {
            if (!BrowserAutomationSkill_1.BrowserAutomationSkill.validate)
                return;
            const validation = BrowserAutomationSkill_1.BrowserAutomationSkill.validate({});
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Action parameter is required');
        });
        it('should validate action types', () => {
            if (!BrowserAutomationSkill_1.BrowserAutomationSkill.validate)
                return;
            const validation = BrowserAutomationSkill_1.BrowserAutomationSkill.validate({ action: 'invalid' });
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Invalid action type');
        });
    });
});
//# sourceMappingURL=BrowserAutomationSkill.test.js.map