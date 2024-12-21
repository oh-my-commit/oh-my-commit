# @oh-my-commit/cli

Command-line interface for Oh My Commit - an AI-powered Git commit message generator.

## Installation

> ⚠️ Note: This package is currently under development and not yet published to npm registry.

### Local Development

```bash
# Clone the repository
git clone https://github.com/cs-magic-open/oh-my-commit.git
cd oh-my-commit

# Install dependencies
pnpm install

# Build the package
pnpm build

# Link the package globally (optional)
cd packages/cli
pnpm link --global  # Create a global link
cd ../..            # Return to project root
```

### After Release

Once the package is published to npm, you will be able to install it via:

#### Global Installation

```bash
npm install -g @oh-my-commit/cli
# or
yarn global add @oh-my-commit/cli
# or
pnpm add -g @oh-my-commit/cli
```

#### Local Installation

```bash
npm install @oh-my-commit/cli
# or
yarn add @oh-my-commit/cli
# or
pnpm add @oh-my-commit/cli
```

## Usage

### If installed globally:

```bash
omc # Generate commit message for staged changes
```

### If installed locally:

```bash
npx omc # Using npx
# or
./node_modules/.bin/omc # Direct path
# or via package.json scripts:
# "scripts": {
#   "commit": "omc"
# }
pnpm commit
```

## Features

- AI-powered commit message generation
- Supports custom AI providers
- Integrates seamlessly with your Git workflow
- Compatible with the Oh My Commit VSCode extension

## Development

This package is part of the Oh My Commit monorepo. To develop locally:

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode during development
pnpm dev
```

## Dependencies

- [@oh-my-commit/extension](../extension) - Core extension functionality
- [@oh-my-commit/shared](../shared) - Shared utilities and types
- [commander](https://github.com/tj/commander.js) - Command-line interface
- [inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive command line prompts
- [simple-git](https://github.com/steveukx/git-js) - Git operations
- [chalk](https://github.com/chalk/chalk) - Terminal styling

## License

MIT
