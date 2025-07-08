# Portal

Portal is a decentralized publishing platform that lets you build your own website with true ownership, built on [Arweave](https://docs.arweave.org/developers/) and [AO](https://ao.arweave.net/). This project consists of two main applications: an editor for content management and a viewer for displaying portals.

## Architecture

The project is organized into two main applications:

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
```

## Building

Build the applications for production:

```bash
# Build editor application
npm run build:editor

# Build viewer application
npm run build:viewer
```

## Deployment

```bash
# Deploy editor to main
npm run deploy:editor:main

# Deploy editor to staging
npm run deploy:editor:staging
```

## Project Structure

```
src/
├── apps/
│   ├── editor/           # Editor application
│   └── viewer/           # Viewer application
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
- `npm run build:editor` - Build editor for production
- `npm run build:viewer` - Build viewer for production
- `npm run deploy:editor:main` - Deploy editor to main environment
- `npm run deploy:editor:staging` - Deploy editor to staging environment

## Environment Variables

Set `VITE_APP` to either `editor` or `viewer` to specify which application to build/serve.

## License

ISC
