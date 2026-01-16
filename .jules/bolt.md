# Bolt's Journal

## 2024-05-22 - [Optimizing SprintsService Counts]
**Learning:** `SprintsService.recalculateTaskCounts` was loading ALL tasks for a sprint into memory just to count them. This is a massive memory and performance bottleneck (N+1 when fetching sprints). Using `createQueryBuilder` with `COUNT` and `CASE WHEN` allows aggregation in the database, reducing memory from O(N) to O(1) and network traffic significantly.
**Action:** Always prefer DB-side aggregation (count, sum) over fetching entities and calculating in memory, especially for frequently accessed data like list views.
