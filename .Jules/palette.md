## 2026-01-22 - Custom Dialog Accessibility
**Learning:** The project uses a custom `Dialog` implementation (`frontend/src/components/atoms/dialog.tsx`) that ignores the installed `@radix-ui/react-dialog` primitives. This custom implementation was missing critical accessibility attributes like `role="dialog"`, `aria-modal="true"`, and `aria-label` on the close button.
**Action:** When working with "atoms" in this codebase, always inspect the implementation to check if it's wrapping a headless library or doing it manually. For manual implementations, manually add ARIA attributes. Specifically for Dialogs, ensure `role`, `aria-modal`, and labelled close buttons are present.

## 2025-01-22 - Broken Atom Components
**Learning:** Found critical syntax errors and broken manual implementations in `tooltip.tsx` and `dialog.tsx` (nested roles, undefined variables, mismatched tags). These prevented the project from building and disabled core UX interactions.
**Action:** When auditing "atom" components, verify they compile and export correctly. Prefer standard shadcn/ui or Radix UI wrappers over custom/manual implementations for consistency and reliability. Use `pnpm build` to catch these issues early if linting is configured to ignore them (or if they are syntactically invalid enough to confuse the linter).

## 2025-02-14 - Icon-only Button Accessibility
**Learning:** Icon-only buttons (like Grid/List view toggles in the Projects page) were missing `aria-label` attributes and tooltips, making them inaccessible to screen readers and unclear to some users.
**Action:** Always verify that buttons with `size="icon"` or those containing only an icon have both an `aria-label` and a wrapping `Tooltip` component to ensure accessibility and clarity.
