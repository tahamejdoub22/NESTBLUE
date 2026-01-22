## 2025-02-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Frontend icon-only buttons using `size='icon'` (e.g., in `Button` component) must have an explicit `aria-label` manually added, as the component does not enforce or generate it automatically.
**Action:** When using `size="icon"`, always verify and add `aria-label`. Search for `size="icon"` to find potential violations.
