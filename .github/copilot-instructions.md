# TimeFlow Tracker - AI Coding Instructions

## Architecture Overview
TimeFlow Tracker is a Next.js 15 app with TypeScript for intelligent time tracking. It uses IndexedDB (via Dexie) for local storage, ensuring privacy-first design. Activities are processed in real-time with AI (DeepSeek) for intent detection and automatic daily analysis.

**Key Components:**
- `app/api/` - API routes for flow management, analysis, chat
- `components/` - React components with mobile-first design
- `lib/` - Business logic, AI services, database layer
- `lib/db/` - IndexedDB facade with Dexie ORM
- `lib/hooks/` - Reactive hooks using `dexie-react-hooks`

## Data Flow & Storage
- **Activities**: Temporary storage in `activities` table, deleted after daily analysis
- **Feedbacks**: Permanent insights in `feedbacks` table
- **Reactive Updates**: Use `useLiveQuery` from `dexie-react-hooks` for real-time UI updates (e.g., `useTodayActivities` in `lib/hooks/useDatabase.ts`)

## AI Integration Patterns
- **Intent Detection**: Classify user input as activity, chat, question, or feedback
- **Context-Aware**: Pass previous activity and daily stats to AI for personalized responses
- **Error Handling**: Always check for `DEEPSEEK_API_KEY`; provide fallback if missing
- **Example**: See `lib/ai-service.ts` for activity processing with context

## Component Patterns
- **Mobile-First**: Design for small screens first, use collapsible sections
- **Modals**: Base `Modal.tsx` for overlays, close on ESC or outside click
- **State Management**: Local state for UI, database hooks for data
- **Example**: `ActivityFlow.tsx` handles input submission with AI processing and pending feedback checks

## Development Workflows
- **Start**: `npm run dev` - runs Next.js dev server
- **Test**: `npm test` - Jest with jsdom, focus on component integration tests
- **Build**: `npm run build` - Next.js production build
- **Lint**: `npm run lint` - ESLint for code quality
- **Database**: IndexedDB auto-initializes; no manual setup needed

## Code Conventions
- **Modularization**: Break large files into focused modules (e.g., `smart-responses.ts` split into cache, templates, strategy)
- **TDD Approach**: Write tests first, especially for UI components
- **Privacy-First**: No external servers except AI API; all data local
- **Flow-Based Tracking**: New activity automatically ends previous one
- **Imports**: Use `@/` alias for absolute imports from project root

## Common Patterns
- **Database Queries**: Use facade in `lib/db/indexeddb.ts` for all DB operations
- **AI Responses**: Cache similar responses in `lib/response-cache.ts` to reduce API calls
- **Auto-Analysis**: Trigger daily at 23:59 via service worker scheduling
- **PWA Features**: Offline support, installable, background sync for pending inputs

## Key Files to Reference
- `ARCHITECTURE.md` - Detailed system design and data flows
- `lib/db/database.ts` - Dexie schema definitions
- `lib/hooks/useDatabase.ts` - Reactive data hooks
- `components/ActivityFlow.tsx` - Main input handling logic
- `lib/ai-service.ts` - AI processing with DeepSeek API