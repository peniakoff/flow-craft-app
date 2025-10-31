# Flow Craft Application - Development Guidelines

This document outlines the development guidelines for the Flow Craft Application, a Next.js project built with TypeScript, Tailwind CSS, and Appwrite.

## 1. Project Structure

- **`app/`**: Next.js App Router pages and layouts. Each route typically has `page.tsx`, `page-client.tsx` (for client components), and `loading.tsx`.
- **`components/`**: Reusable UI components, categorized into general components and `ui/` for Shadcn UI components.
- **`contexts/`**: React Context API providers for global state management.
- **`hooks/`**: Custom React hooks.
- **`lib/`**: Utility functions, Appwrite client setup, and data fetching logic.
- **`public/`**: Static assets like images and CSS files.
- **`styles/`**: Global CSS styles.
- **`tokens/`**: Design tokens, accessibility guidelines, and microcopy.
- **`types/`**: TypeScript type definitions.

## 2. Technologies Used

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Appwrite
- **State Management**: React Context API (primarily)
- **UI Components**: Radix UI (via Shadcn UI)
- **Language/Locale**: The application is developed in English and English is currently the only supported language/locale.

## 3. Code Style and Formatting

- Adhere to existing ESLint and Prettier configurations.
- Use TypeScript for all new components and logic.
- Follow the established naming conventions for files, components, and variables.

## 4. Component Development

- **Client vs. Server Components**: Understand and correctly use Next.js Client and Server Components. Client components should be explicitly marked with `"use client"`.
- **Shadcn UI**: Utilize components from `components/ui` where appropriate. Customize them by extending Tailwind CSS configuration.
- **Reusability**: Design components to be as reusable as possible.

## 5. Data Fetching

- Data fetching primarily occurs in server components or using `lib/data.ts` and `lib/appwrite.ts` for client-side interactions with Appwrite.

## 6. Testing

- Currently, there are no explicit test files identified in the provided structure. When adding new features or fixing bugs, consider adding unit or integration tests using a suitable framework (e.g., Jest, React Testing Library).

## 7. Deployment

- The application is designed for deployment on Vercel, given it's a Next.js project.

## 8. Commit Messages

- Follow conventional commit guidelines (e.g., `feat: add new feature`, `fix: resolve bug`, `docs: update documentation`).

## 9. Accessibility

- Refer to `tokens/accessibility.md` for guidelines on creating accessible user interfaces.
