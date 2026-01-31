## 2025-10-27 - TooltipProvider Scope
**Learning:** `TooltipProvider` is not included in the global `Providers` component but is scoped to `AppLayout`. This means isolated component testing or pages outside the app layout must explicitly wrap components in `TooltipProvider` for tooltips to function.
**Action:** When testing components with tooltips in isolation, always wrap them in `TooltipProvider`.
