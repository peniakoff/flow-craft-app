# Flow Craft Application - Agent Instructions

This document provides specific instructions for AI agents interacting with the Flow Craft Application project.

## 1. Project Overview

- **Type**: Next.js 16+ web application.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS, Shadcn UI.
- **Backend**: Appwrite.
- **Language/Locale**: The application is developed in English and English is currently the only supported language/locale.
- **Key Areas**: `app/` (routing), `components/` (UI), `lib/` (utilities/API).

## 2. Common Tasks for Agents

### 2.1. Code Modification

- **Adherence to Conventions**: Always prioritize existing code style, component patterns, and file structure.
- **TypeScript**: Ensure all new or modified code is type-safe.
- **Styling**: Use Tailwind CSS classes for styling. If custom styles are needed, extend `tailwind.config.ts` or use global CSS sparingly.
- **Shadcn UI**: When creating new UI elements, check `components/ui` first for existing components that can be reused or extended.

### 2.2. Running Tests

- **No explicit test setup found**: Currently, there are no dedicated test scripts or configurations in `package.json` or test files in the project structure. If asked to run tests, inform the user about this and suggest setting up a testing framework (e.g., Jest, React Testing Library).

### 2.3. Building the Application

- To build the Next.js application, use the following command:
  ```bash
  pnpm build
  ```
  or
  ```bash
  npm run build
  ```
  (Check `package.json` for the exact script if `pnpm` is not the preferred package manager).

### 2.4. Starting the Development Server

- To start the development server, use:
  ```bash
  pnpm dev
  ```
  or
  ```bash
  npm run dev
  ```

### 2.5. Linting and Formatting

- The project likely uses ESLint and Prettier. To run linting and formatting checks, refer to `package.json` for scripts like `lint` or `format`. If not present, assume standard ESLint and Prettier commands.

## 3. Important Files and Directories

- **`package.json`**: For dependencies and scripts.
- **`next.config.mjs`**: Next.js configuration.
- **`tailwind.config.ts`**: Tailwind CSS configuration.
- **`tsconfig.json`**: TypeScript configuration.
- **`lib/appwrite.ts`**: Appwrite client initialization and API interactions.
- **`lib/utils.ts`**: General utility functions.

## 4. Interaction with Appwrite

- When interacting with the backend, refer to `lib/appwrite.ts` for established patterns of using the Appwrite SDK.

## 5. Asking for Clarification

- If any task or instruction is unclear, ask for clarification from the user. Do not make assumptions that could lead to incorrect modifications.
