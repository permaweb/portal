# Portal Documentation System

This document explains the Portal's built-in documentation system, which provides in-app help and guidance for portal operators.

---

## Overview

Portal features a dynamic documentation system built into the editor application. The system loads Markdown files from the `/src/apps/editor/views/Docs/MD/` directory and presents them in a navigable interface with:

- **Hierarchical organization** with sections and subsections
- **Dynamic loading** of Markdown content
- **Navigation components** for easy browsing
- **Template-based rendering** for consistent presentation

---

## Architecture

### Directory Structure

```
src/apps/editor/views/Docs/
├── MD/                    # Markdown content files
│   ├── overview/
│   │   └── introduction.md
│   ├── setup/
│   │   ├── categories.md
│   │   ├── links.md
│   │   ├── media.md
│   │   └── topics.md
│   └── posts/
│       └── editor.md
├── DocTemplate/           # Document rendering component
├── DocsNavigationHeader/  # Top navigation component
├── DocsNavigationFooter/  # Bottom navigation component
├── load-docs.ts          # Dynamic Markdown loader
├── order-docs.ts         # Navigation structure definition
├── index.tsx             # Main docs view component
└── styles.ts             # Styled components
```

### Key Components

#### 1. Document Loader (`load-docs.ts`)

**Purpose**: Dynamically loads and organizes Markdown files using Webpack's `require.context`

**Functions**:

- `getDocTree()` - Builds a tree structure of available docs
- `loadDoc(docPath)` - Loads specific Markdown content
- `readDirectory(ctx)` - Recursively processes directory structure

**Example Usage**:

```typescript
import { loadDoc, getDocTree } from './load-docs';

// Load specific document
const content = loadDoc('overview/introduction');

// Get full documentation tree
const tree = getDocTree();
```

#### 2. Navigation Order (`order-docs.ts`)

**Purpose**: Defines the hierarchical navigation structure and display order

**Structure**:

```typescript
export const docsOrder = [
	{
		name: 'Overview',
		path: 'overview',
		children: [{ name: 'Introduction', path: 'introduction' }],
	},
	{
		name: 'Setup',
		path: 'setup',
		children: [
			{ name: 'Categories', path: 'categories' },
			{ name: 'Links', path: 'links' },
			{ name: 'Topics', path: 'topics' },
			{ name: 'Media', path: 'media' },
		],
	},
	{
		name: 'Posts',
		path: 'posts',
		children: [{ name: 'Editor', path: 'editor' }],
	},
];
```

#### 3. Main Documentation View (`index.tsx`)

**Purpose**: Orchestrates the documentation display with navigation components

**Components**:

- `DocsNavigationHeader` - Top navigation with breadcrumbs and section links
- `DocTemplate` - Renders the Markdown content
- `DocsNavigationFooter` - Bottom navigation with prev/next links

---

## Content Organization

### Current Documentation Sections

#### Overview

- **Introduction** (`overview/introduction.md`)
  - Welcome message and platform overview
  - Key features and capabilities
  - Dashboard navigation guide

#### Setup

- **Categories** (`setup/categories.md`) - _TODO: Content needed_
- **Links** (`setup/links.md`) - _TODO: Content needed_
- **Topics** (`setup/topics.md`) - _TODO: Content needed_
- **Media** (`setup/media.md`) - _TODO: Content needed_

#### Posts

- **Editor** (`posts/editor.md`)
  - Block-based editing system
  - Content creation workflow
  - Available block types and shortcuts

### Content Guidelines

#### Markdown Format

- Use standard Markdown syntax
- Include clear headings (`#`, `##`, `###`)
- Use bullet points for feature lists
- Include code examples where relevant

#### Structure Requirements

- Start with main heading (`#`)
- Use subheadings for organization
- Include "Key Components" sections for complex topics
- End with practical usage examples

#### Example Template

```markdown
# Section Title

Brief description of the section's purpose and scope.

#### Key Components

- **Component 1**: Description and purpose
- **Component 2**: Description and purpose

#### Basic Usage

Step-by-step instructions for common tasks:

- **Task 1**

  - Step-by-step instructions
  - Additional details

- **Task 2**
  - Step-by-step instructions
  - Additional details
```

---

## Adding New Documentation

### 1. Create Markdown File

Create a new `.md` file in the appropriate directory under `/MD/`:

```bash
# For setup documentation
touch src/apps/editor/views/Docs/MD/setup/new-topic.md

# For a new section
mkdir src/apps/editor/views/Docs/MD/new-section
touch src/apps/editor/views/Docs/MD/new-section/topic.md
```

### 2. Update Navigation Order

Add the new documentation to `order-docs.ts`:

```typescript
export const docsOrder = [
	// ... existing sections
	{
		name: 'New Section',
		path: 'new-section',
		children: [
			{
				name: 'Topic',
				path: 'topic',
			},
		],
	},
];
```

### 3. Write Content

Follow the content guidelines and use the existing `introduction.md` and `editor.md` as references for style and structure.

---

## Technical Implementation

### Dynamic Loading System

The documentation system uses Webpack's `require.context` to automatically discover and load Markdown files:

```typescript
// Automatically includes all .md files in the MD directory
const docsContext: any = (require as any).context('./MD', true, /\.md$/);

// Builds directory tree structure
const readDirectory = (ctx: any) => {
	const dir = {};
	ctx.keys().forEach((key: any) => {
		const parts = key.slice(2).split('/');
		let currentLevel: any = dir;
		parts.forEach((part: any) => {
			const isFile = /\.md$/.test(part);
			const name = isFile ? part.slice(0, -3) : part;
			// ... tree building logic
		});
	});
	return dir;
};
```

### Navigation System

The navigation system combines:

1. **Static order definition** (`order-docs.ts`) for display hierarchy
2. **Dynamic content discovery** (`load-docs.ts`) for available files
3. **Route-based rendering** for deep linking to specific sections

### Styling Integration

The documentation system uses the Portal's theme system:

- Consistent typography using theme fonts
- Theme-aware colors for light/dark mode support
- Responsive design for different screen sizes
- Styled components for maintainable CSS

---

## Future Enhancements

### Potential Improvements

1. **Search Functionality**

   - Full-text search across all documentation
   - Keyword highlighting in results

2. **Interactive Elements**

   - Embedded demos or screenshots
   - Interactive tutorials or walkthroughs

3. **Content Management**

   - Admin interface for editing documentation
   - Version control for content changes

4. **Enhanced Navigation**

   - Table of contents for long documents
   - Quick jump links within sections

5. **Multilingual Support**
   - Language selection for international users
   - Localized content management

### Development Workflow

To work on the documentation system:

1. **Content Updates**: Edit Markdown files in `/MD/` directory
2. **Navigation Changes**: Modify `order-docs.ts` structure
3. **Component Updates**: Edit React components for presentation
4. **Styling Changes**: Update styled components in `styles.ts`

---

## Summary

The Portal documentation system provides a flexible, maintainable way to deliver in-app help content. Its dynamic loading system automatically discovers new content, while the navigation order system provides structured presentation. This design allows for easy content updates without code changes and maintains consistency with the Portal's overall design system.

Key benefits:

- **Automatic content discovery** - Add files and they appear in the system
- **Hierarchical organization** - Clear structure for complex topics
- **Theme integration** - Consistent with Portal's design system
- **Developer-friendly** - Markdown-based content creation
- **Maintainable** - Separation of content, structure, and presentation
