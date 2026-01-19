## 2024-05-22 - [SprintsService N+1 Query]
**Learning:** `SprintsService.findAll` was performing an N+1 query (actually 2N+2) by recalculating task counts for every sprint on every fetch. This was done to "ensure counts are fresh", but `TasksService` already maintains these counts on write.
**Action:** Removed the recalculation loop from `findAll` and optimized `recalculateTaskCounts` to use `count()` queries instead of loading entities. Always verify if "read repair" logic is actually needed or if "write maintenance" is sufficient.
