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
exports.FileSystemUI = void 0;
const vscode = __importStar(require("vscode"));
const FileSystemSkill_1 = require("../skills/FileSystemSkill");
class FileSystemUI {
    static show(context) {
        if (this.currentPanel) {
            this.currentPanel.reveal();
            return;
        }
        const panel = vscode.window.createWebviewPanel(this.viewType, 'File System Operations', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getWebviewContent();
        panel.onDidDispose(() => this.currentPanel = undefined, null, context.subscriptions);
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case 'executeOperation':
                    try {
                        const result = yield FileSystemSkill_1.FileSystemSkill.execute(message.params);
                        panel.webview.postMessage({
                            command: 'operationResult',
                            success: result.success,
                            output: result.output,
                            error: result.error
                        });
                    }
                    catch (error) {
                        panel.webview.postMessage({
                            command: 'operationResult',
                            success: false,
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                    return;
            }
        }), undefined, context.subscriptions);
        this.currentPanel = panel;
    }
    static getWebviewContent() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File System Operations</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>
        </head>
        <body class="bg-gray-100 p-6">
            <div class="max-w-3xl mx-auto">
                <h1 class="text-2xl font-bold mb-6 text-gray-800">
                    <i class="fas fa-folder-open mr-2"></i> File System Operations
                </h1>
                
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <form id="operationForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Operation</label>
                            <select id="operation" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                                <option value="read">Read File</option>
                                <option value="write">Write File</option>
                                <option value="delete">Delete File</option>
                                <option value="list">List Directory</option>
                                <option value="stat">Get File Stats</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Path</label>
                            <input id="path" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                        </div>
                        
                        <div id="contentField" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea id="content" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                        
                        <div>
                            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm">
                                Execute
                            </button>
                        </div>
                    </form>
                </div>
                
                <div id="resultContainer" class="hidden bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-medium text-gray-800 mb-4">Result</h2>
                    <pre id="resultOutput" class="bg-gray-50 p-4 rounded overflow-auto text-sm"></pre>
                </div>
                
                <div id="errorContainer" class="hidden bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">Error</h3>
                            <div id="errorOutput" class="mt-2 text-sm text-red-700"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                document.getElementById('operation').addEventListener('change', (e) => {
                    const contentField = document.getElementById('contentField');
                    if (e.target.value === 'write') {
                        contentField.classList.remove('hidden');
                    } else {
                        contentField.classList.add('hidden');
                    }
                });
                
                document.getElementById('operationForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const operation = document.getElementById('operation').value;
                    const path = document.getElementById('path').value;
                    const content = document.getElementById('content').value;
                    
                    vscode.postMessage({
                        command: 'executeOperation',
                        params: {
                            operation,
                            path,
                            ...(operation === 'write' && { content })
                        }
                    });
                });
                
                window.addEventListener('message', event => {
                    const { command, success, output, error } = event.data;
                    if (command === 'operationResult') {
                        if (success) {
                            document.getElementById('resultOutput').textContent = JSON.stringify(output, null, 2);
                            document.getElementById('resultContainer').classList.remove('hidden');
                            document.getElementById('errorContainer').classList.add('hidden');
                        } else {
                            document.getElementById('errorOutput').textContent = error;
                            document.getElementById('errorContainer').classList.remove('hidden');
                            document.getElementById('resultContainer').classList.add('hidden');
                        }
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
exports.FileSystemUI = FileSystemUI;
FileSystemUI.viewType = 'mafia.filesystem';
//# sourceMappingURL=FileSystemUI.js.map