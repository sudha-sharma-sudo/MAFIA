import { EnhancedSkillDefinition, SkillExecutionResult, SkillContext } from '../core/EnhancedSkillTypes';
import type { Browser, Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

interface BrowserArtifacts {
  browser?: Browser;
  page?: Page;
}

interface BrowserParams {
  action: 'launch' | 'navigate' | 'click' | 'type' | 'screenshot' | 'close';
  url?: string;
  selector?: string;
  text?: string;
  timeout?: number;
  viewport?: { width: number; height: number };
}

export const BrowserAutomationSkill: EnhancedSkillDefinition = {
  validate: (params: any) => {
    const errors: string[] = [];
    if (!params.action) {
      errors.push('Action parameter is required');
    } else if (!['launch', 'navigate', 'click', 'type', 'screenshot', 'close'].includes(params.action)) {
      errors.push('Invalid action type');
    }
    return { valid: errors.length === 0, errors };
  },
  metadata: {
    name: 'browser-automation',
    version: '1.0.0',
    description: 'Control browser sessions for web testing and automation',
    dependencies: ['tool-use'],
    parameters: {
      action: {
        type: 'string',
        required: true,
        description: 'Browser action to perform',
        validation: (value) => ['launch', 'navigate', 'click', 'type', 'screenshot', 'close'].includes(value)
      },
      url: {
        type: 'string',
        required: false,
        description: 'URL to navigate to'
      },
      selector: {
        type: 'string',
        required: false,
        description: 'CSS selector for element interaction'
      },
      text: {
        type: 'string',
        required: false,
        description: 'Text to type into elements'
      },
      timeout: {
        type: 'number',
        required: false,
        description: 'Action timeout in milliseconds',
        default: 30000
      },
      viewport: {
        type: 'object',
        required: false,
        description: 'Browser viewport dimensions'
      }
    }
  },

  async execute(params: BrowserParams, context?: SkillContext): Promise<SkillExecutionResult> {
    try {
      const startTime = Date.now();
      const artifacts = (context as SkillContext & { artifacts?: BrowserArtifacts })?.artifacts;
      let browser = artifacts?.browser;
      let page = artifacts?.page;
      let output: any;

      switch (params.action) {
        case 'launch':
          browser = await puppeteer.launch();
          page = await browser.newPage();
          if (params.viewport) {
            await page.setViewport(params.viewport);
          }
          output = { status: 'browser_launched' };
          break;

        case 'navigate':
          if (!page) throw new Error('No active browser page');
          await page.goto(params.url!, { timeout: params.timeout });
          output = { url: params.url, status: 'navigation_complete' };
          break;

        case 'click':
          if (!page) throw new Error('No active browser page');
          await page.click(params.selector!, { timeout: params.timeout } as any);
          output = { selector: params.selector, action: 'clicked' };
          break;

        case 'type':
          if (!page) throw new Error('No active browser page');
          await page.type(params.selector!, params.text!, { timeout: params.timeout } as any);
          output = { selector: params.selector, action: 'text_entered', text: params.text };
          break;

        case 'screenshot':
          if (!page) throw new Error('No active browser page');
          output = await page.screenshot({ encoding: 'base64' });
          break;

        case 'close':
          if (browser) {
            await browser.close();
            output = { status: 'browser_closed' };
          }
          break;
      }

      return {
        success: true,
        output,
        artifacts: { browser, page },
        metrics: {
          duration: Date.now() - startTime,
          // action: params.action - removed as it's not part of metrics interface
        }
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          duration: 0
        }
      };
    }
  }
};