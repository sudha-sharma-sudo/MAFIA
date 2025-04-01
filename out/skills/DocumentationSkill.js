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
Object.defineProperty(exports, "__esModule", { value: true });
const DocumentationSkill = {
    metadata: {
        name: 'documentation',
        version: '1.0.0',
        description: 'Generates comprehensive code documentation',
        dependencies: ['code-analysis'],
        parameters: {
            code: {
                type: 'string',
                required: true,
                description: 'Source code to document'
            },
            format: {
                type: 'string',
                required: false,
                description: 'Output format (markdown or html)',
                default: 'markdown'
            }
        }
    },
    validate: (params) => {
        const errors = [];
        if (!params.code)
            errors.push('Missing required parameter: code');
        if (params.format && !['markdown', 'html'].includes(params.format)) {
            errors.push('Invalid format - must be markdown or html');
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    },
    timeout: 5000,
    execute: (params, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const startTime = Date.now();
        try {
            const { code, format = 'markdown' } = params;
            // Generate documentation based on code analysis
            const analysis = (context === null || context === void 0 ? void 0 : context.knowledgeGraph)
                ? yield context.knowledgeGraph.findSimilarDecisions('code-analysis')
                : [];
            let documentation = '';
            if (format === 'markdown') {
                documentation = generateMarkdownDocs(code, analysis);
            }
            else {
                documentation = generateHtmlDocs(code, analysis);
            }
            return {
                success: true,
                output: documentation,
                metrics: {
                    duration: Date.now() - startTime,
                    memoryUsage: 0,
                    cpuUsage: 0
                }
            };
        }
        catch (error) {
            (_a = context === null || context === void 0 ? void 0 : context.logger) === null || _a === void 0 ? void 0 : _a.error(`Documentation generation failed: ${error}`);
            return {
                success: false,
                output: null,
                error: error instanceof Error ? error.message : String(error),
                metrics: {
                    duration: Date.now() - startTime
                }
            };
        }
    })
};
function generateMarkdownDocs(code, analysis = []) {
    let md = `# Code Documentation\n\n`;
    md += `## Overview\n\n`;
    md += `Automatically generated documentation for the provided code.\n\n`;
    if (analysis.length > 0) {
        md += `## Analysis Insights\n\n`;
        analysis.forEach(insight => {
            md += `- ${insight.rationale}\n`;
        });
    }
    md += `## Code Structure\n\n`;
    md += `\`\`\`typescript\n${code}\n\`\`\`\n`;
    return md;
}
function generateHtmlDocs(code, analysis = []) {
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Code Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .code { background: #f4f4f4; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Code Documentation</h1>
  <section>
    <h2>Overview</h2>
    <p>Automatically generated documentation for the provided code.</p>
  </section>`;
    if (analysis.length > 0) {
        html += `
  <section>
    <h2>Analysis Insights</h2>
    <ul>`;
        analysis.forEach(insight => {
            html += `\n      <li>${insight.rationale}</li>`;
        });
        html += `
    </ul>
  </section>`;
    }
    html += `
  <section>
    <h2>Code Structure</h2>
    <pre class="code"><code>${escapeHtml(code)}</code></pre>
  </section>
</body>
</html>`;
    return html;
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');
}
exports.default = DocumentationSkill;
//# sourceMappingURL=DocumentationSkill.js.map