## 2024-05-23 - N+1 Query Anti-Pattern in List Views
**Learning:** Found a severe N+1 (actually 2N+2) query pattern in `SprintsService.findAll`. It was recalculating derived data (task counts) for every item in the list by fetching all related entities, updating the item, and then re-fetching the list.
**Action:**
1. Rely on event-driven updates (updating counts on write) rather than read-time recalculation.
2. If read-time aggregation is needed, use `GROUP BY` or `count()` queries instead of loading entities into memory.
3. Avoid modifying state (UPDATE) inside a read operation (GET), as it kills read scalability and introduces locking issues.
