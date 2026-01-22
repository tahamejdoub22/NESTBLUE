## 2024-05-23 - Tooltip Implementation Refactor
**Learning:** Custom UI implementations (like `createPortal` for tooltips) often lack critical accessibility features (positioning, focus management) that libraries like Radix UI provide out-of-the-box.
**Action:** Always check if a headless UI library (like Radix or Headless UI) is available in the project dependencies before maintaining or writing custom complex interactive components.
**Learning:** React 19 types are stricter regarding `RefObject` nullability, causing friction when updating existing codebases.
**Action:** Be careful when touching files with `useRef` in React 19 projects; ensure `RefObject` types match exact nullability expectations.
