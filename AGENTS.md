# Repository conventions

## Stack and scope

- Use Next.js App Router, strict TypeScript, Bun, and CSS Modules.
- Use Bun for dependencies and scripts. Keep `bun.lock`; do not add npm, pnpm, or Yarn lockfiles.
- Keep components as Server Components unless an interaction requires a small client boundary.
- Payments, Worker APIs, and D1 integration are a later phase. Keep the landing-page setup independent.

## Required structure and naming

- Keep Next route files in `app/` using Next's reserved lowercase names, such as `page.tsx` and `layout.tsx`.
- Every reusable component lives in `app/components/<PascalCaseName>/`.
- The component entry is always `index.tsx`, exporting a named default function matching its folder.
- Its stylesheet is always `<PascalCaseName>.module.css` in the same folder.
- Optional component types use `<PascalCaseName>.types.ts`. Colocated hooks use `use<PascalCaseName>.ts` or a descriptive `use...` name.
- Shared hooks belong in `app/hooks/` and use `usePascalCase.ts` naming.
- Shared content and utility files belong in `app/content/` and `app/lib/`, using lowercase kebab-case `.ts` names.
- Global design tokens live in `app/styles/tokens.css`; resets/base styles live in `app/globals.css`.
- Public assets live in `public/` with lowercase kebab-case filenames.
- Use `@/` for cross-folder imports and relative imports for files inside the same component.
- Keep CSS class names camelCase. Use tokens for shared colours and typography.

## Design constraints

- Preserve the original Spin Cycle Exodia wordmark.
- Headings use appropriately licensed GC Palioka; paragraphs and UI use Rubik. Never copy the personal-use Palioka evaluation sample from planning into public assets.
- Implement future motion mobile-first, using native scrolling and a readable reduced-motion fallback.
- Local plans, references, prototypes, and research remain in ignored `planning/` and `.cache/` directories. They are not application assets.

## Verification

- Run `bun scripts/check-structure.ts` when this ignored local helper is present. Run `bun run typecheck`, `bun run lint`, and `bun run build` before handoff when source/configuration changes affect them.
- Do not claim browser verification from a successful build. Report actual limits.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
