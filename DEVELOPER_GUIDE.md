# BLACKBOX AI Assistant - Developer Guide

## Setup & Installation
```bash
# Clone repository
git clone <repo-url>
cd MAFIA

# Install dependencies
npm install

# Install vsce (Visual Studio Code Extensions) globally
npm install -g vsce
```

## Development Commands
```bash
# Compile TypeScript (watch mode)
npm run watch

# Run tests
npm test

# Run specific test file
npm test -- FileSystemSkill.test.ts

# Check test coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Building & Packaging
```bash
# Compile for production
npm run compile

# Package extension (VSIX)
vsce package

# Package with specific version
vsce package --major|minor|patch

# Skip warnings during packaging
vsce package --yarn --no-verify
```

## Installation & Testing
```bash
# Install extension locally
code --install-extension blackbox-ai-assistant-1.0.0.vsix

# List installed extensions
code --list-extensions

# Uninstall extension
code --uninstall-extension blackbox-ai-assistant

# Reload VSCode window (after changes)
Ctrl+R (or Cmd+R on Mac)
```

## Debugging
```bash
# Run extension in debug mode
F5 (in VSCode with debug configuration)

# View extension logs
View → Output → Select "Extension Host" from dropdown

# Debug specific test
Add debug configuration for Jest tests
```

## Deployment
```bash
# Publish to Marketplace (requires publisher token)
vsce publish

# Publish patch update
vsce publish patch

# Verify Marketplace metadata
vsce verify-pat
```

## Common Issues & Fixes
```bash
# Resolve dependency issues
rm -rf node_modules package-lock.json
npm install

# Fix TypeScript version conflicts
npm install typescript@latest --save-dev

# Clear Jest cache
npm test --clearCache

# Reset VSCode extension host
Developer: Reload Window (from Command Palette)
```

## Performance Optimization
```bash
# Bundle extension (recommended)
npm install -g @vscode/vsce
vsce package --no-yarn --no-dependencies

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build -- --analyze