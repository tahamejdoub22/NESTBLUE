# Bolt's Journal

## 2024-05-22 - [N+1 Query in SprintsService]
**Learning:** Found a severe N+1 (actually 2N+1) issue in `SprintsService.findAll`. It fetches all sprints, then loops through each to fetch ALL tasks for that sprint (loading entities into memory), updates the sprint count, and then fetches all sprints again. This is O(S * T) where S is sprints and T is tasks.
**Action:** Always trust incremental updates (if available) or use `GROUP BY` / `count()` aggregation queries instead of loading entities for counting. Never perform writes (updates) inside a standard `findAll` read operation.
