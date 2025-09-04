# Portal

Portal is a decentralized publishing platform that lets you build your own website with true ownership, built on [Arweave](https://docs.arweave.org/developers/) and [AO](https://ao.arweave.net/). This project consists of three main applications: an editor for content management, a viewer for displaying portals, and an engine for dynamic portal rendering.

## Architecture

The project is organized into three main applications:

#### Editor (`/src/apps/editor/`)

- Content creation and management interface
- Portal configuration and setup
- User management and permissions
- Design customization tools
- Media library management

#### Viewer (`/src/apps/viewer/`)

- Public-facing portal display
- Post viewing and navigation
- Category browsing
- Responsive design for end users

#### Engine (`/src/apps/engine/`)

- Dynamic portal rendering engine
- Theme system integration
- Zone-based layout system
- Profile and post management
- Customizable building blocks

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

# Start viewer application (port 4000)
npm run start:viewer

# Start engine application (port 5000)
npm run start:engine

# Start editor in testnet mode (uses tario tokens)
npm run start:editor:testnet

# Start viewer in testnet mode
npm run start:viewer:testnet

# Start engine in testnet mode
npm run start:engine:testnet
```

## Building

Build the applications for production:

```bash
# Build editor application
npm run build:editor

# Build viewer application
npm run build:viewer

# Build engine application
npm run build:engine

# Build for testnet
npm run build:editor:testnet
npm run build:viewer:testnet
```

## Deployment

```bash
# Deploy editor to main
npm run deploy:editor:main

# Deploy editor to staging
npm run deploy:editor:staging

# Deploy engine
npm run deploy:engine
```

## Project Structure
Development Guide to follow while working on the Project - https://github.com/permaweb/portal/blob/main/docs/styleguide.md

```
src/
├── apps/
│   ├── editor/           # Editor application
│   ├── viewer/           # Viewer application
│   └── engine/           # Engine application
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

## Scripts

- `npm run format` - Format code with ESLint and Prettier
- `npm run start:editor` - Start editor in development mode
- `npm run start:viewer` - Start viewer in development mode
- `npm run start:engine` - Start engine in development mode
- `npm run build:editor` - Build editor for production
- `npm run build:viewer` - Build viewer for production
- `npm run build:engine` - Build engine for production
- `npm run deploy:editor:main` - Deploy editor to main environment
- `npm run deploy:editor:staging` - Deploy editor to staging environment
- `npm run deploy:engine` - Deploy engine to production

## Environment Variables

- `VITE_APP` - Set to `editor`, `viewer`, or `engine` to specify which application to build/serve
- `VITE_TESTNET` - Set to `true` to enable testnet mode (uses tario tokens instead of turbo credits)

## Testnet Mode

The application supports testnet mode for development and testing:

- **Mainnet**: Uses turbo credits, and ario token (if balance available) for domain purchases
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
