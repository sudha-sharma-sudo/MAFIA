import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from './ai/AIService';
import { MAFIAAgent } from './core/AgentSystem';

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('blackboxai');
    const apiKey = config.get<string>('apiKey', '');
    
    if (!apiKey) {
        vscode.window.showErrorMessage('BLACKBOX AI: API key not configured');
    }

    const aiService = new AIService();
    const agent = new MAFIAAgent();
    
    // Import and register skills
    const CodeAnalysisSkill = require('./skills/CodeAnalysisSkill').default;
    const CodeRefactorSkill = require('./skills/CodeRefactorSkill').default;
    
    agent.skillSet.registerSkill(CodeAnalysisSkill);
    agent.skillSet.registerSkill(CodeRefactorSkill);

    // Initialize agent with AI service
    agent.skillSet.getSkill('code-analysis')!.execute = 
        async (params: any) => {
            const startTime = Date.now();
            const output = await aiService.analyzeCode(params.code);
            return {
                output,
                success: true,
                metrics: {
                    duration: Date.now() - startTime,
                    memoryUsage: 0,
                    cpuUsage: 0
                }
            };
        };
    agent.skillSet.getSkill('code-refactor')!.execute = 
        async (params: any) => {
            const startTime = Date.now();
            const output = await aiService.refactorCode(params.code, params.refactorType);
            return {
                output,
                success: true,
                metrics: {
                    duration: Date.now() - startTime,
                    memoryUsage: 0,
                    cpuUsage: 0
                }
            };
        };

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('blackboxai.showAssistant', async () => {
            const panel = vscode.window.createWebviewPanel(
                'blackboxAI',
                'BLACKBOX AI Assistant',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );

            panel.webview.html = getWebviewContent();
            
            panel.webview.onDidReceiveMessage(
                async message => {
                    try {
                    const response = await aiService.analyzeCode(message.text);
                        panel.webview.postMessage({ 
                            command: 'response', 
                            data: response 
                        });
                    } catch (error) {
                        panel.webview.postMessage({
                            command: 'error',
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                },
                undefined,
                context.subscriptions
            );
        }),

        vscode.commands.registerCommand('blackboxai.analyzeCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                try {
                    const analysis = await aiService.analyzeCode(editor.document.getText());
                    vscode.window.showInformationMessage(analysis);
                } catch (error) {
                    vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }),

        vscode.commands.registerCommand('blackboxai.generateDocs', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                try {
                    const docs = await aiService.analyzeCode(editor.document.getText());
                    const docPath = editor.document.fileName + '.md';
                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.file(docPath),
                        Buffer.from(docs)
                    );
                    vscode.window.showInformationMessage(`Documentation generated at ${docPath}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Documentation generation failed: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }),

        vscode.commands.registerCommand('blackboxai.refactorCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            try {
    const result = await agent.executeTask({
        id: uuidv4(),
        type: 'refactoring',
                    parameters: { 
                        code: editor.document.getText(),
                        refactorType: await vscode.window.showQuickPick(
                            ['optimize', 'clean', 'simplify', 'general'],
                            { placeHolder: 'Select refactor type (optional)' }
                        )
                    }
                });

                if (result.success) {
                    const doc = await vscode.workspace.openTextDocument({
                        content: result.output,
                        language: editor.document.languageId
                    });
                    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Refactor failed: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        })
    );
}

function getWebviewContent(): string {
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

export function deactivate() {}