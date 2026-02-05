## 2024-05-22 - Broken Component Patterns
**Learning:** Discovered that some basic atom components (specifically `tooltip.tsx`) contained malformed/broken code, likely from improper copy-pasting or merges. This prevented the use of essential UX patterns like tooltips.
**Action:** When encountering "missing" UX features that should be present (like tooltips), check the underlying component implementation first. It might be broken rather than just unused.

## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** Many icon-only buttons in the application lack `aria-label` and tooltips, making them inaccessible to screen readers and unclear to users.
**Action:** systematically audit `size="icon"` Button usages and add `aria-label` + `Tooltip` wrapper.
