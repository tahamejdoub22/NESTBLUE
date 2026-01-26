## 2026-01-22 - Custom Dialog Accessibility
**Learning:** The project uses a custom `Dialog` implementation (`frontend/src/components/atoms/dialog.tsx`) that ignores the installed `@radix-ui/react-dialog` primitives. This custom implementation was missing critical accessibility attributes like `role="dialog"`, `aria-modal="true"`, and `aria-label` on the close button.
**Action:** When working with "atoms" in this codebase, always inspect the implementation to check if it's wrapping a headless library or doing it manually. For manual implementations, manually add ARIA attributes. Specifically for Dialogs, ensure `role`, `aria-modal`, and labelled close buttons are present.

## 2026-05-21 - Broken Component Primitives
**Learning:** Found that `Tooltip` (like `Dialog`) was also implemented manually despite having Radix dependencies installed, leading to broken functionality and accessibility gaps. The manual implementations were incomplete and buggy.
**Action:** Instead of patching the manual implementations, replace them entirely with standard Radix UI wrappers (shadcn/ui pattern) when the dependencies are already present. This ensures full accessibility and reliability with less custom code.
