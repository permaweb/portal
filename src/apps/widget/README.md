# Permaweb Chat Widget

An embeddable chat, comments, and encrypted private messaging widget built on AO (Arweave Orchestration). Ships as a single self-contained IIFE bundle that any webpage can drop in with a `<script>` tag.

---

## Scope

The widget covers three real-time communication modes, all backed by the same AO comments process:

| Mode         | Purpose                                        | Poll Default |
| ------------ | ---------------------------------------------- | ------------ |
| **chat**     | Public, flat message stream (live chat)        | 5 s          |
| **comments** | Threaded discussion with moderation & rules    | 30 s         |
| **private**  | End-to-end encrypted group messaging (AES-GCM) | 5 s          |

Each mode is a standalone view that shares the same wallet connection, profile system, and AO transport layer.

---

## What We Wanted

1. A **drop-in embed** — one script tag, no framework dependencies on the host page.
2. **Reuse the existing `comments.lua` AO process** instead of building a separate chat backend. Chat messages are just comments with `depth: 0` and no threading.
3. Three modes behind one widget so portals can offer live chat, article comments, or private group messaging without deploying separate apps.
4. Wallet flexibility — support the user's own Arweave wallet, a delegated wallet from a parent frame, or auto-detect.
5. Light/dark/auto theming that respects the host page.
6. Moderation & comment rules enforcement out of the box.

---

## What We Covered

### Frontend

- **React + Vite** app compiled to a single IIFE bundle (`dist/widget/bundle.js`).
- Three view components: `ChatView`, `CommentsView`, `PrivateView`.
- Shared UI: `Avatar`, `ConnectButton`, `EmojiPicker`.
- Styled-components with CSS custom properties for theming.
- i18n provider scaffolded (English only for now).

### Data Layer

- `useMessages` — flat message fetching + polling + send (chat & private modes).
- `useComments` — threaded comment fetching with moderation filtering.
- `useCommentRules` — enforces profile-age, thumbnail, and muted-word rules.
- `useModeration` — loads blocked users/comments from a separate moderation process.
- `useEncryption` — client-side AES-GCM encrypt/decrypt for private mode.
- `useProfile` — profile lookup with localStorage caching.

### Wallet & Auth

- `WalletBridgeProvider` with three strategies: `own`, `delegate`, `auto`.
- `auto` tries delegate (parent-frame postMessage) for 2 s, then falls back to the user's browser wallet.

### Configuration

- Parsed from `data-*` attributes on the script tag **or** URL query params (URL wins).
- Sensible defaults: mode `chat`, wallet `auto`, theme `auto`, height `500px`.

### Real-time Updates

- Interval-based polling (configurable via `data-poll-interval`).
- Optimistic refetch on local sends via a `commentAdded` CustomEvent on `window`.

---

## How We Reuse `comments.lua`

The key insight: **a chat message is just a comment**. The AO `comments.lua` process already handles storing, retrieving, and threading comments for portal articles. Instead of building a new process, the widget talks to the exact same process using the exact same handlers:

```
┌─────────────┐        @permaweb/libs         ┌──────────────────┐
│  Widget UI  │  ─────────────────────────►    │  comments.lua    │
│  (browser)  │  libs.getComments()            │  (AO process)    │
│             │  libs.createComment()          │                  │
│             │  libs.getRules()               │  Same process    │
│             │  libs.updateCommentContent()   │  used by portal  │
└─────────────┘                                │  article comments│
                                               └──────────────────┘
```

### What each mode does with comments.lua

- **Chat mode** — calls `getComments` / `createComment` with no `parentId`. Every message is a root-level comment. The UI sorts by `dateCreated` and renders them flat.
- **Comments mode** — uses `parentId` for threading. Supports `depth: -1` (pinned), `depth: 0` (root), and `depth > 0` (replies). Filters by `rootSource === dataSource` to scope comments to the current context.
- **Private mode** — same `createComment` call, but content is encrypted client-side before sending. The AO process stores opaque ciphertext. Decryption happens in the browser using a shared group secret.

### What this means

- No new Lua code was written for chat.
- Any existing comments process can double as a chat room — just point the widget at its process ID.
- Moderation rules configured for comments (muted words, profile requirements, blocked users) automatically apply to chat too.
- The moderation process (`data-moderation-id`) is optional and separate from the comments process, so the same moderation list can be shared across multiple chat/comment instances.

---

## Embedding

### Basic (chat)

```html
<script data-process-id="YOUR_COMMENTS_PROCESS_ID" src="https://your-cdn.com/widget/bundle.js"></script>
```

### Comments with moderation

```html
<script
	data-process-id="YOUR_COMMENTS_PROCESS_ID"
	data-mode="comments"
	data-moderation-id="YOUR_MODERATION_PROCESS_ID"
	data-theme="dark"
	data-height="600px"
	src="https://your-cdn.com/widget/bundle.js"
></script>
```

### Private encrypted chat

```html
<script
	data-process-id="YOUR_COMMENTS_PROCESS_ID"
	data-mode="private"
	data-wallet="own"
	src="https://your-cdn.com/widget/bundle.js"
></script>
```

### All configuration options

| Attribute            | URL Param      | Type                          | Default      | Description                    |
| -------------------- | -------------- | ----------------------------- | ------------ | ------------------------------ |
| `data-process-id`    | `processId`    | `string`                      | — (required) | AO comments process ID         |
| `data-mode`          | `mode`         | `chat \| comments \| private` | `chat`       | Widget mode                    |
| `data-wallet`        | `wallet`       | `own \| delegate \| auto`     | `auto`       | Wallet connection strategy     |
| `data-theme`         | `theme`        | `light \| dark \| auto`       | `auto`       | Color theme                    |
| `data-moderation-id` | `moderationId` | `string`                      | —            | Optional moderation process ID |
| `data-poll-interval` | `pollInterval` | `number` (ms)                 | 5000 / 30000 | Polling interval               |
| `data-height`        | `height`       | CSS value                     | `500px`      | Widget height                  |
| `data-title`         | `title`        | `string`                      | Mode name    | Header title                   |

---

## Project Structure

```
src/apps/widget/
├── App.tsx                          # Mode router
├── index.tsx                        # Entry, renders into #permaweb-chat
├── types.ts                         # WidgetConfig, WidgetMode, etc.
├── global-styles.ts                 # Light/dark theme CSS variables
├── config/
│   ├── defaults.ts                  # Default config values
│   └── parseConfig.ts              # Script attrs + URL params parser
├── components/
│   ├── ChatView/                    # Flat message stream
│   ├── CommentsView/                # Threaded + moderated
│   ├── PrivateView/                 # Encrypted group chat
│   └── shared/                      # Avatar, ConnectButton, EmojiPicker
├── hooks/
│   ├── useMessages.ts               # Fetch/send (chat & private)
│   ├── useComments.ts               # Fetch with moderation filtering
│   ├── useModeration.ts             # Blocked users/comments
│   ├── useEncryption.ts             # AES-GCM encrypt/decrypt
│   └── useProfile.ts               # Profile lookup + caching
└── providers/
    ├── WidgetProvider.tsx            # Config context
    ├── WidgetPermawebProvider.tsx    # AO/Arweave/libs init
    ├── WalletBridgeProvider.tsx      # Wallet connection
    └── WidgetLanguageProvider.tsx    # i18n
```

---

## Dependencies

| Package               | Role                                      |
| --------------------- | ----------------------------------------- |
| `@permaweb/libs`      | Core API — comments, profiles, moderation |
| `@permaweb/aoconnect` | AO process communication                  |
| `arweave`             | Arweave client & signing                  |
| `styled-components`   | Component styling                         |
| `react` / `react-dom` | UI framework (bundled into IIFE)          |
