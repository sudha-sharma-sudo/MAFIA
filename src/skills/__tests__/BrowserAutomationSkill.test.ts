import { BrowserAutomationSkill } from '../BrowserAutomationSkill';
import { SkillContext } from '../../core/EnhancedSkillTypes';
import puppeteer from 'puppeteer-core';

// Mock puppeteer
jest.mock('puppeteer-core', () => ({
  launch: jest.fn(),
}));

const mockedPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;

describe('BrowserAutomationSkill', () => {
  const mockContext: SkillContext & { artifacts?: any } = {
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
    mockedPuppeteer.launch.mockResolvedValue(mockBrowser as any);
  });

  describe('launch action', () => {
    it('should launch browser successfully', async () => {
      const result = await BrowserAutomationSkill.execute({
        action: 'launch',
        viewport: { width: 1024, height: 768 }
      }, mockContext);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ status: 'browser_launched' });
      expect(mockPage.setViewport).toHaveBeenCalledWith({ width: 1024, height: 768 });
    });
  });

  describe('navigation', () => {
    it('should navigate to URL successfully', async () => {
      mockContext.artifacts = { page: mockPage };
      mockPage.goto.mockResolvedValue(null);

      const result = await BrowserAutomationSkill.execute({
        action: 'navigate',
        url: 'https://example.com',
        timeout: 30000
      }, mockContext);

      expect(result.success).toBe(true);
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', { timeout: 30000 });
    });

    it('should handle navigation errors', async () => {
      mockContext.artifacts = { page: mockPage };
      mockPage.goto.mockRejectedValue(new Error('Navigation timeout'));

      const result = await BrowserAutomationSkill.execute({
        action: 'navigate',
        url: 'https://example.com'
      }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Navigation timeout');
    });
  });

  describe('element interaction', () => {
    beforeEach(() => {
      mockContext.artifacts = { page: mockPage };
    });

    it('should click element successfully', async () => {
      const result = await BrowserAutomationSkill.execute({
        action: 'click',
        selector: '#submit'
      }, mockContext);

      expect(result.success).toBe(true);
      expect(mockPage.click).toHaveBeenCalledWith('#submit', { timeout: undefined });
    });

    it('should type text successfully', async () => {
      const result = await BrowserAutomationSkill.execute({
        action: 'type',
        selector: '#search',
        text: 'test query'
      }, mockContext);

      expect(result.success).toBe(true);
      expect(mockPage.type).toHaveBeenCalledWith('#search', 'test query', { timeout: undefined });
    });
  });

  describe('validation', () => {
    it('should require action parameter', () => {
      if (!BrowserAutomationSkill.validate) return;
      const validation = BrowserAutomationSkill.validate({});
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Action parameter is required');
    });

    it('should validate action types', () => {
      if (!BrowserAutomationSkill.validate) return;
      const validation = BrowserAutomationSkill.validate({ action: 'invalid' });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid action type');
    });
  });
});