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
exports.BrowserAutomationSkill = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
exports.BrowserAutomationSkill = {
    validate: (params) => {
        const errors = [];
        if (!params.action) {
            errors.push('Action parameter is required');
        }
        else if (!['launch', 'navigate', 'click', 'type', 'screenshot', 'close'].includes(params.action)) {
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
    execute(params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startTime = Date.now();
                const artifacts = context === null || context === void 0 ? void 0 : context.artifacts;
                let browser = artifacts === null || artifacts === void 0 ? void 0 : artifacts.browser;
                let page = artifacts === null || artifacts === void 0 ? void 0 : artifacts.page;
                let output;
                switch (params.action) {
                    case 'launch':
                        browser = yield puppeteer_core_1.default.launch();
                        page = yield browser.newPage();
                        if (params.viewport) {
                            yield page.setViewport(params.viewport);
                        }
                        output = { status: 'browser_launched' };
                        break;
                    case 'navigate':
                        if (!page)
                            throw new Error('No active browser page');
                        yield page.goto(params.url, { timeout: params.timeout });
                        output = { url: params.url, status: 'navigation_complete' };
                        break;
                    case 'click':
                        if (!page)
                            throw new Error('No active browser page');
                        yield page.click(params.selector, { timeout: params.timeout });
                        output = { selector: params.selector, action: 'clicked' };
                        break;
                    case 'type':
                        if (!page)
                            throw new Error('No active browser page');
                        yield page.type(params.selector, params.text, { timeout: params.timeout });
                        output = { selector: params.selector, action: 'text_entered', text: params.text };
                        break;
                    case 'screenshot':
                        if (!page)
                            throw new Error('No active browser page');
                        output = yield page.screenshot({ encoding: 'base64' });
                        break;
                    case 'close':
                        if (browser) {
                            yield browser.close();
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
            }
            catch (error) {
                return {
                    success: false,
                    output: null,
                    error: error instanceof Error ? error.message : String(error),
                    metrics: {
                        duration: 0
                    }
                };
            }
        });
    }
};
//# sourceMappingURL=BrowserAutomationSkill.js.map