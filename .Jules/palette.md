## 2025-02-20 - Custom Modal Accessibility
**Learning:** The custom `Dialog` component (`frontend/src/components/atoms/dialog.tsx`) was implemented without basic ARIA roles (`role="dialog"`, `aria-modal`) or labels for icon buttons.
**Action:** When auditing custom UI components, prioritize checking for missing ARIA attributes on structural elements (modals, drawers) and icon-only buttons.
