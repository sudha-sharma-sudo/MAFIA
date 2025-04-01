"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const uuid_1 = require("uuid");
const AIService_1 = require("./ai/AIService");
const AgentSystem_1 = require("./core/AgentSystem");
function activate(context) {
    const config = vscode.workspace.getConfiguration('blackboxai');
    const apiKey = config.get('apiKey', '');
    if (!apiKey) {
        vscode.window.showErrorMessage('BLACKBOX AI: API key not configured');
    }
    const aiService = new AIService_1.AIService();
    const agent = new AgentSystem_1.MAFIAAgent();
    // Import and register skills
    const CodeAnalysisSkill = require('./skills/CodeAnalysisSkill').default;
    const CodeRefactorSkill = require('./skills/CodeRefactorSkill').default;
    agent.skillSet.registerSkill(CodeAnalysisSkill);
    agent.skillSet.registerSkill(CodeRefactorSkill);
    // Initialize agent with AI service
    agent.skillSet.getSkill('code-analysis').execute =
        (params) => __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const output = yield aiService.analyzeCode(params.code);
            return {
                output,
                success: true,
                metrics: {
                    duration: Date.now() - startTime,
                    memoryUsage: 0,
                    cpuUsage: 0
                }
            };
        });
    agent.skillSet.getSkill('code-refactor').execute =
        (params) => __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const output = yield aiService.refactorCode(params.code, params.refactorType);
            return {
                output,
                success: true,
                metrics: {
                    duration: Date.now() - startTime,
                    memoryUsage: 0,
                    cpuUsage: 0
                }
            };
        });
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('blackboxai.showAssistant', () => __awaiter(this, void 0, void 0, function* () {
        const panel = vscode.window.createWebviewPanel('blackboxAI', 'BLACKBOX AI Assistant', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield aiService.analyzeCode(message.text);
                panel.webview.postMessage({
                    command: 'response',
                    data: response
                });
            }
            catch (error) {
                panel.webview.postMessage({
                    command: 'error',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }), undefined, context.subscriptions);
    })), vscode.commands.registerCommand('blackboxai.analyzeCode', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            try {
                const analysis = yield aiService.analyzeCode(editor.document.getText());
                vscode.window.showInformationMessage(analysis);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    })), vscode.commands.registerCommand('blackboxai.generateDocs', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            try {
                const docs = yield aiService.analyzeCode(editor.document.getText());
                const docPath = editor.document.fileName + '.md';
                yield vscode.workspace.fs.writeFile(vscode.Uri.file(docPath), Buffer.from(docs));
                vscode.window.showInformationMessage(`Documentation generated at ${docPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Documentation generation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    })), vscode.commands.registerCommand('blackboxai.refactorCode', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        try {
            const result = yield agent.executeTask({
                id: (0, uuid_1.v4)(),
                type: 'refactoring',
                parameters: {
                    code: editor.document.getText(),
                    refactorType: yield vscode.window.showQuickPick(['optimize', 'clean', 'simplify', 'general'], { placeHolder: 'Select refactor type (optional)' })
                }
            });
            if (result.success) {
                const doc = yield vscode.workspace.openTextDocument({
                    content: result.output,
                    language: editor.document.languageId
                });
                yield vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Refactor failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    })));
}
exports.activate = activate;
function getWebviewContent() {
    return [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '    <title>BLACKBOX AI</title>',
        '    <script src="https://cdn.tailwindcss.com"></script>',
        '    <style>',
        '        .loader {',
        '            border: 3px solid #f3f3f3;',
        '            border-top: 3px solid #3498db;',
        '            border-radius: 50%;',
        '            width: 20px;',
        '            height: 20px;',
        '            animation: spin 1s linear infinite;',
        '        }',
        '        @keyframes spin {',
        '            0% { transform: rotate(0deg); }',
        '            100% { transform: rotate(360deg); }',
        '        }',
        '    </style>',
        '</head>',
        '<body class="bg-gray-50 p-4">',
        '    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">',
        '        <h1 class="text-2xl font-bold text-gray-800 mb-4">BLACKBOX AI Assistant</h1>',
        '        ',
        '        <div class="mb-4">',
        '            <textarea id="query" ',
        '                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"',
        '                placeholder="Ask me anything about your code..."></textarea>',
        '            <button id="submit" ',
        '                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">',
        '                Submit',
        '            </button>',
        '        </div>',
        '',
        '        <div id="status" class="hidden flex items-center text-gray-500 mb-4">',
        '            <div class="loader mr-2"></div>',
        '            <span>Processing your request...</span>',
        '        </div>',
        '',
        '        <div id="response" class="prose max-w-none"></div>',
        '',
        '        <div class="mt-6 border-t pt-4">',
        '            <h3 class="font-semibold text-lg mb-2">Recent Queries</h3>',
        '            <ul id="history" class="space-y-1"></ul>',
        '        </div>',
        '    </div>',
        '',
        '    <script>',
        '        const vscode = acquireVsCodeApi();',
        '        const history = JSON.parse(localStorage.getItem(\'queryHistory\') || \'[]\');',
        '        ',
        '        document.getElementById(\'submit\').addEventListener(\'click\', async () => {',
        '            const query = document.getElementById(\'query\').value.trim();',
        '            if (!query) return;',
        '            ',
        '            document.getElementById(\'status\').classList.remove(\'hidden\');',
        '            document.getElementById(\'response\').innerHTML = \'\';',
        '            ',
        '            try {',
        '                const response = await new Promise((resolve, reject) => {',
        '                    vscode.postMessage({ ',
        '                        command: \'query\', ',
        '                        text: query ',
        '                    });',
        '                    ',
        '                    window.addEventListener(\'message\', event => {',
        '                        if (event.data.command === \'response\') {',
        '                            resolve(event.data.data);',
        '                        } else if (event.data.command === \'error\') {',
        '                            reject(event.data.error);',
        '                        }',
        '                    }, { once: true });',
        '                });',
        '                ',
        '                document.getElementById(\'response\').innerHTML = response;',
        '                history.unshift({ query, response });',
        '                localStorage.setItem(\'queryHistory\', JSON.stringify(history));',
        '                updateHistory();',
        '            } catch (error) {',
        '                document.getElementById(\'response\').innerHTML = ',
        '                    \'<div class="text-red-500">Error: \' + error + \'</div>\';',
        '            } finally {',
        '                document.getElementById(\'status\').classList.add(\'hidden\');',
        '            }',
        '        });',
        '',
        '        function updateHistory() {',
        '            const historyEl = document.getElementById(\'history\');',
        '            historyEl.innerHTML = history.slice(0, 5).map(item => ',
        '                \'<li class="cursor-pointer hover:text-blue-500" \' +',
        '                \'onclick="document.getElementById(\\\\\'query\\\\\').value=\\\\\'\' + ',
        '                item.query.replace(/\\\'/g, "\\\\\'") + \'\\\\\'">\' +',
        '                item.query.substring(0, 50) + \'...\' +',
        '                \'</li>\'',
        '            ).join(\'\');',
        '        }',
        '',
        '        updateHistory();',
        '    </script>',
        '</body>',
        '</html>'
    ].join('\n');
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map