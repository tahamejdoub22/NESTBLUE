# Template Folder

This folder contains template render functions that extract HTML/JSX structure from components and pages.

## Structure

- `component/atoms/` - Template render functions for atomic components
- `component/molecules/` - Template render functions for molecular components
- `component/organisms/` - Template render functions for organism components
- `page/` - Template render functions for page components

## Usage

Templates are render functions that return JSX. Components call these functions to render their HTML structure.

### Example:

```tsx
// Template file: template/component/molecules/stat-card.template.tsx
export function renderStatCard(props: StatCardTemplateProps) {
  return (
    <Card>
      {/* HTML/JSX structure */}
    </Card>
  );
}

// Component file: components/molecules/stat-card.tsx
import { renderStatCard } from "@/template/component/molecules/stat-card.template";

export function StatCard(props: StatCardProps) {
  return renderStatCard(props);
}
```

## Benefits

- Separation of concerns: Logic in components, structure in templates
- Reusability: Templates can be used across different contexts
- Maintainability: HTML structure is centralized and easier to update
- Testing: Templates can be tested independently

