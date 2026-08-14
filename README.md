# Portal

Portal is a decentralized publishing platform that lets you build your own website with true ownership, built on [Arweave](https://docs.arweave.org/developers/) and [AO](https://ao.arweave.net/). This project consists of two main applications: an editor for content management, and an engine for dynamic portal rendering.

Portal has two persistence modes:

- `process` (default) preserves the existing AO process-backed implementation.
- `base` uses immutable Arweave transactions without AO processes. A small genesis manifest establishes the portal and its initial roles; subsequent `portal-release` transactions contain only changed fields or pointers to independently stored post revisions. Clients reconstruct the current portal by validating and folding authorized releases in Arweave order.

Compact releases let multiple admins and contributors publish changes without re-uploading every post. Concurrent releases from the same earlier state are merged in transaction order, while role changes take effect before later releases are authorized. Scalar settings, including the `blog`/`docs` layout mode, use direct values; users, categories, topics, links, domains, uploads, and themes use identity-keyed item operations; and pages, fonts, and post preview definitions use leaf-level object patches. Anonymous ordered arrays use compact index/splice operations, while post releases contain only immutable post transaction pointers. Legacy whole-field releases remain readable.

Both modes use `up.arweave.net` for uploads up to 100 KB. Larger uploads are submitted as L1 Arweave transactions and paid from the connected wallet's AR balance.

## Architecture

The project is organized into two main applications:

#### Editor (`/src/apps/editor/`)

- Content creation and management interface
- Portal configuration and setup
- User management and permissions
- Design customization tools
- Media library management

#### Engine (`/src/apps/engine/`)

- Dynamic portal rendering engine
- Theme system integration
- Zone-based layout system
- Profile and post management
- Customizable building blocks

#### Engine Lite (`/src/apps/engine-lite/`)

- Framework-free blog feed, post routes, and documentation navigation
- Preserves portal light/dark colors and configured fonts while using Lunar's documentation geometry for docs
- Supports scalar `blog` and Lunar-style `docs` layouts while ignoring legacy page-builder data
- Ships as one self-contained JavaScript bundle referenced through `reference@1.0`

## Installation

```bash
# Install dependencies
npm install
```

## Development

Start the development servers:

```bash
# Start editor application (port 3000)
npm run start:editor

# Start engine application (port 5000)
npm run start:engine

# Start stripped-back engine application (port 4100)
npm run start:engine-lite

# Start either application in Arweave-only base mode
npm run start:editor:base
npm run start:engine:base
```

## Building

Build the applications for production:

```bash
# Build editor application
npm run build:editor

# Build engine application
npm run build:engine

# Build the single-file lite engine
npm run build:engine-lite

# Build the Arweave-only base-mode applications
npm run build:editor:base
npm run build:engine:base
```

## Deployment

```bash
# Deploy editor to main
npm run deploy:editor:main

# Deploy editor to staging
npm run deploy:editor:staging

# Deploy engine
npm run deploy:engine

# Upload Engine Lite and update the stable reference@1.0 pointer
PATH_TO_WALLET=/path/to/wallet.json npm run publish:engine-lite

# Override the reference to update
PATH_TO_WALLET=/path/to/wallet.json npm run publish:engine-lite -- --reference <reference-id>

# Bootstrap a separate new reference (normally unnecessary)
PATH_TO_WALLET=/path/to/wallet.json npm run publish:engine-lite -- --new-reference
```

The current Engine Lite `reference@1.0` mapping is recorded in [`deployments/engine-lite.json`](deployments/engine-lite.json).
New portals store that stable ID as `EngineReference`; their HTML loader resolves its current value at runtime. The publish command updates the recorded reference by default and refreshes the fallback transaction in the deployment file.

## Project Structure

Development Guide to follow while working on the Project - https://github.com/permaweb/portal/blob/main/docs/styleguide.md

```
src/
├── apps/
│   ├── editor/           # Editor application
│   ├── engine/           # Full engine application
│   └── engine-lite/      # Blog and documentation engine
├── components/           # Shared UI components
│   ├── atoms/           # Basic UI elements
│   ├── molecules/       # Composed components
│   └── organisms/       # Complex components
├── helpers/             # Utility functions and configs
├── hooks/               # Custom React hooks
├── providers/           # Context providers
├── wallet/              # Wallet integration
└── wrappers/            # Component wrappers
```

## Environment Variables

- `VITE_APP` - Set to `editor`, `viewer`, or `engine` to specify which application to build/serve
- `VITE_PORTAL_MODE` - Set to `base` for transaction/manifest persistence; defaults to `process`
- `VITE_ENABLE_AO` - Set to `false` to disable AO connection initialization (base-mode scripts set this automatically)
- `VITE_ARIO_TESTNET` - Set to `true` to enable testnet mode (uses tario instead of ARIO)

## Testnet Mode

The application supports testnet mode for development and testing:

- **Mainnet**: Uses ARIO for domain purchases
- **Testnet**: Uses tario tokens for domain purchases

### Using Testnet Mode

1. **Start in testnet mode:**

   ```bash
   npm run start:editor:testnet
   ```

2. **Get tario tokens** - Use the https://faucet.arweave.net/ faucet to get test tokens

3. **Purchase domains** - Domain registration will use tario tokens instead of turbo credits

## License

ISC
