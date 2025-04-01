// Create a complete mock of the vscode API
const vscode = {
    commands: {
        getCommands: () => Promise.resolve([
            'blackboxai.showAssistant',
            'blackboxai.analyzeCode', 
            'blackboxai.generateDocs'
        ])
    },
    window: {
        createWebviewPanel: () => ({}),
        showErrorMessage: () => {},
        showInformationMessage: () => {}
    },
    workspace: {
        getConfiguration: () => ({
            get: () => 'test-api-key'
        })
    }
};

// Make the mock available globally
global.vscode = vscode;