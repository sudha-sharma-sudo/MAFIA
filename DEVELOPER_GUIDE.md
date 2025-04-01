# Developer Guide v2.0

## File Management System Architecture

### UI Components
- **FileManagerUI.ts**: Main component
- **FileList.tsx**: Responsive file grid
- **FileUpload.tsx**: Drag-and-drop uploader

### Key Features
- Modern Tailwind CSS styling
- Real-time error handling
- Mobile-first design
- Keyboard accessibility

### Integration Example
```typescript
import { listFiles, uploadFile } from '../skills/FileSystemSkill';

// Get files
const files = await listFiles('/documents');

// Upload file
await uploadFile(newFile, '/uploads');
```

## Setup
```bash
npm install tailwindcss @types/react
npm run dev
```

## Testing
```bash
npm test src/webview/**/*.test.tsx