# React Style Guide Overview

For detailed code examples, see [styleguide.md](styleguide-detail.md).

This codebase follows atomic design principles with components organized into atoms, molecules, and organisms based on complexity. All styling is theme-driven using styled-components, requiring theme values for colors, typography, and spacing instead of hardcoded values. Components use the `props.` prefix pattern without destructuring in function signatures, and follow an ordering convention for hooks, state, effects, and JSX.

Data management follows cache-first loading patterns with progressive enhancement, loading cached data immediately for instant UI while fetching fresh data in the background. Providers follow a consistent structure with DEFAULT_CONTEXT, custom hooks named `use[Name]Provider`, and context values exposed through dedicated provider components.

Error handling uses `debugLog` for development logging and `addNotification` for user-facing messages, always providing fallback error messages. Loading states wrap async operations with try/catch blocks. Forms track original values alongside current state for change detection and selective updates, only sending modified fields to the API.

## Core Principles

**Structure & Organization**

- Atomic design: atoms → molecules → organisms
- Component structure: ComponentName.tsx + index.ts + styles.ts
- Import order: React → third-party → providers → components → helpers → styles
- Hook order: navigation → app providers → global providers → derived values → refs/state/effects

**Props & Naming**

- Use `props.` prefix, avoid destructuring in signatures
- Handlers: `handle` prefix (handleSubmit, handleToggle)
- State: descriptive (isLoading, hasError, selectedItem)
- Constants: UPPER_SNAKE_CASE
- Types: all reusable types in helpers/types.ts
- Comments: capitalize first letter

**Data & State Management**

- Cache-first loading: show cached data immediately, fetch fresh data in background
- Progressive loading: fetch data on-demand to avoid N+1 queries
- Selective refresh: toggle trigger pattern with specific field updates
- Refs for control: prevent duplicate operations, track user interactions
- Form changes: track original vs current state, detect changes with JSON.stringify

**Performance**

- Strategic memoization with useMemo for expensive computations and stable references
- useCallback for handlers passed as props
- React.memo for pure components
- Memoize language-dependent values with languageProvider.current dependency

**Error Handling & Logging**

- debugLog for development (not shown to users)
- addNotification for user-facing messages
- Always provide fallback error messages (e.message ?? 'Fallback message')
- Loading state in finally blocks to ensure cleanup

**Styling & Theming**

- Always use theme values, never hardcode colors/fonts/spacing
- Helper functions in styles.ts for complex conditional styling
- Responsive patterns

**Patterns**

- Async effects: IIFE pattern with try/catch
- Context providers: DEFAULT_CONTEXT with no-op functions
- Authorization: early declaration after hooks, combining permissions with ownership
- i18n: all user text from language provider with optional chaining
- View structure: ViewHeader + content wrapper + modals outside wrapper
