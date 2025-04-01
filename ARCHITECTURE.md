# FileSystem UI Architecture

## Component Diagram
```
┌─────────────────────────────────────────────────┐
│               VSCode Extension                  │
│                                                 │
│  ┌─────────────┐    ┌───────────────────────┐  │
│  │ Command     │    │ WebviewPanel          │  │
│  │ Registration│    │                       │  │
│  └──────┬──────┘    └───────────┬───────────┘  │
│         │                       │              │
│         ▼                       ▼              │
│  ┌─────────────┐    ┌───────────────────────┐  │
│  │ FileSystem  │    │ FileSystemUI          │  │
│  │ Skill       │    │ (Webview)             │  │
│  └──────┬──────┘    └───────────┬───────────┘  │
│         │                       │              │
│         ▼                       ▼              │
│  ┌─────────────┐    ┌───────────────────────┐  │
│  │ Node.js     │    │ HTML/CSS/JS           │  │
│  │ File System │    │ (Tailwind, FontAwesome)│  │
│  │ API         │    │                       │  │
│  └─────────────┘    └───────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Data Flow
```
┌───────────┐    ┌───────────┐    ┌───────────┐
│   User    │───▶│ Webview   │───▶│ Extension │
│ Interface │    │   UI      │    │  Backend  │
└───────────┘    └───────────┘    └─────┬─────┘
                                         ▼
                                 ┌───────────────┐
                                 │ File System   │
                                 │ Operations    │
                                 └───────────────┘
```

## FileSystem Skill Class Diagram
``` 
┌───────────────────────────────┐
│       FileSystemSkill         │
├───────────────────────────────┤
│ - metadata: SkillMetadata     │
│ - validate(params): Validation│
│ - execute(params): Promise    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       FileSystemUI            │
├───────────────────────────────┤
│ - currentPanel: WebviewPanel  │
│ - show(context): void         │
│ - getWebviewContent(): string │
└───────────────────────────────┘
```

## Sequence Diagram
```
User            Webview        Extension       FileSystem
 │                │               │               │
 │  Open UI       │               │               │
 │───────────────▶│               │               │
 │                │  Create Panel │               │
 │                │──────────────▶│               │
 │                │               │  Init Skill   │
 │                │               │──────────────▶│
 │                │◀──────────────│               │
 │◀───────────────│               │               │
 │                │               │               │
 │  File Op       │               │               │
 │───────────────▶│               │               │
 │                │  Forward Op   │               │
 │                │──────────────▶│               │
 │                │               │ Execute Op    │
 │                │               │──────────────▶│
 │                │               │◀──────────────│
 │                │◀──────────────│               │
 │◀───────────────│               │               │