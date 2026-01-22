## 2024-05-22 - Keyboard Accessible Tooltips
**Learning:** The custom `Tooltip` implementation used a wrapper `div` that only handled mouse events (`onMouseEnter`, `onMouseLeave`), ignoring keyboard focus. This meant keyboard users navigating the sidebar received no tooltip feedback for icon-only buttons.
**Action:** Always ensure `TooltipTrigger` components handle `onFocus` and `onBlur` events, delegating them to the same handlers as mouse events (or dedicated ones) to support keyboard users.
