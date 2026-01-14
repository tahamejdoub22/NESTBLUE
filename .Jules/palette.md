## 2025-05-22 - Icon-Only Button Accessibility Pattern
**Learning:** The application extensively uses `size="icon"` buttons (e.g., in Navbar and Sidebar) without enforcing `aria-label` at the component level. This leaves primary navigation elements inaccessible to screen readers.
**Action:** When using `size="icon"`, always manually verify and add `aria-label`. Consider adding a prop or lint rule to enforce accessible names for icon-only buttons in the future.
