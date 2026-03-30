# SwiftShopy Agent Guidelines

## Build, Lint, and Test Commands

### Development Server
```bash
npm run dev  # Starts Next.js dev server on port 3014
```

### Building for Production
```bash
npm run build  # Creates production build
npm run start  # Starts production server
```

### Linting
```bash
npm run lint  # Runs ESLint on all files
```

### Testing
```bash
npm run test          # Runs Vitest in watch mode
npm run test:run      # Runs tests once and exits
npm run test:coverage # Runs tests with coverage report
```

### Running a Single Test
```bash
npx vitest run __tests__/lib/2fa.test.ts  # Run specific test file
npx vitest run -t "test name pattern"     # Run tests matching pattern
```

### End-to-End Tests (Playwright)
```bash
npm run e2e         # Runs Playwright tests
npm run e2e:ui      # Opens Playwright UI mode
```

### Database Operations
```bash
npx convex login    # Authenticate with Convex
npx convex deploy   # Deploy schema and functions
npx convex run seed:seedAll  # Seed sample data
```

## Code Style Guidelines

### TypeScript Conventions
- Use TypeScript strict mode where possible
- Prefer interfaces for object shapes, types for unions/primitives
- Export types from `types/` directory when shared across modules
- Use PascalCase for types/interfaces, camelCase for variables/functions
- Avoid `any` type; use `unknown` when type is uncertain
- Use explicit return types for public functions
- Utilize Zod for runtime validation at boundaries

### Import Organization
1. External libraries (React, Next.js, etc.)
2. Internal absolute imports using `@/` alias
3. Relative imports (`./`, `../`)
4. Type-only imports on separate lines with `type` keyword
5. Group imports with blank lines between categories

Example:
```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/utils';
import type { Product } from '@/types';

import Button from '@/components/ui/button';
```

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Functions/variables: camelCase (`handleSubmit`, `userCount`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- Files: kebab-case (`user-profile.tsx`)
- Test files: `.test.ts` or `.test.tsx` suffix
- Custom hooks: `use` prefix (`useAuth`, `useFormValidation`)

### Error Handling
- Use try/catch for async operations
- Create custom error classes for domain-specific errors
- Handle errors at appropriate layers (don't swallow silently)
- Log errors appropriately using console.error in development
- Show user-friendly messages in UI, not technical details
- Use Zod for input validation at API boundaries

### React Component Guidelines
- Use functional components with hooks
- Prefer named exports for components
- Extract complex logic into custom hooks
- Use TypeScript generics for reusable components
- Keep components small and focused
- Use proper accessibility attributes (aria-label, etc.)
- Memoize expensive computations with useMemo/useCallback
- Follow React hooks rules (only call hooks at top level)

### Styling with Tailwind CSS
- Use utility classes in logical groups:
  1. Positioning
  2. Box model (margin, padding, width, height)
  3. Typography
  4. Background/borders
  5. Interactive states (hover, focus)
  6. Transitions/animations
- Extract repeated utility patterns into components
- Use `@apply` sparingly in CSS for complex components
- Follow Tailwind's recommended class ordering (use Headwind plugin if available)
- Use semantic HTML elements when possible

### Convex Backend Guidelines
- Define clear schema in `convex/schema.ts`
- Separate queries and mutations by domain
- Use proper TypeScript typing for document structures
- Validate inputs with Zod before database operations
- Handle edge cases (null values, empty arrays)
- Use indexes for frequently queried fields
- Write comprehensive tests for business logic
- Document complex functions with JSDoc comments

### File Organization
- Group related files by feature/domain
- Keep components close to their usage when possible
- Use barrel exports (`index.ts`) judiciously
- Separate concerns: UI, logic, data, styles
- Follow Next.js App Router conventions:
  - `app/` for routes and layouts
  - `components/` for reusable UI
  - `lib/` for utilities and helpers
  - `hooks/` for custom React hooks
  - `types/` for TypeScript definitions
  - `convex/` for backend functions
  - `__tests__/` for tests mirroring source structure

### Commit Message Conventions
Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code restructuring
- `perf:` for performance improvements
- `test:` for adding/modifying tests
- `chore:` for maintenance tasks

Example: `feat: add MTN MoMo payment webhook handler`

## Additional Notes
- The project uses Next.js 14 with App Router
- State management primarily uses React hooks and Convex reactivity
- Authentication handled via NextAuth.js
- Payments integrate with MTN Mobile Money and Airtel Money APIs
- Environment variables stored in `.env.local` (not committed)
- Maximum portability: avoid browser/node-specific globals without checks