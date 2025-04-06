# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

-   Client: `bun run dev` (development), `bun run build` (production), `bun run lint`, `bun run pretty`
-   Server: `bun run dev` or `bun run --watch src/index.ts` (Bun.js), `bun run pretty`

## Code Style Guidelines

-   **TypeScript**: Use strict typing, interfaces for props/data, and avoid `any`
-   **Naming**: PascalCase for components/interfaces, camelCase for functions/variables, 'use' prefix for hooks
-   **Imports**: React imports first, third-party packages next, local imports last
-   **Formatting**: Prettier with 150 character line length, 4 spaces indentation
-   **Components**: Function components with explicit type annotations
-   **Error Handling**: Try/catch with appropriate error responses, central error messages in `utils/messages.ts`
-   **API Responses**: Follow standard format `{ success: boolean, data?: any, error?: string }`
-   **Authentication**: JWT-based with access and refresh tokens
-   **Backend**: Built with Bun.js and Elysia framework

Always run linting before committing changes.
