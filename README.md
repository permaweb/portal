# Portal

Portal is a decentralized publishing platform that lets you build your own website with true ownership, built on [Arweave](https://docs.arweave.org/developers/) and [AO](https://ao.arweave.net/). This project consists of two main applications: an editor for content management, and an engine for dynamic portal rendering.

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
```

## Building

Build the applications for production:

```bash
# Build editor application
npm run build:editor

# Build engine application
npm run build:engine
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

## Environment Variables

- `VITE_APP` - Set to `editor`, `viewer`, or `engine` to specify which application to build/serve
- `VITE_ARIO_TESTNET` - Set to `true` to enable testnet mode (uses tario tokens instead of turbo credits)

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
