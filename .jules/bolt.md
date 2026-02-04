## 2024-05-23 - Dashboard N+1 Recalculation Pattern
**Learning:** The `DashboardService` (and potentially `SprintsService`) implements a pattern of explicitly recalculating entity counts (like sprint tasks) on every read by performing a fresh database query for each entity inside a loop. This creates severe N+1 query performance issues.
**Action:** When working on "overview" services, check for loops that perform recalculations. Prefer using already loaded data (in-memory filtering) or trusted database columns. If recalculation is strictly necessary, use bulk `GROUP BY` queries instead of iterative `find` queries.

## 2024-05-24 - SprintsService N+1 Recalculation
**Learning:** The `SprintsService.findOne` method was recalculating task counts on every read, causing a hidden N+1 query issue (2 extra queries per read) and also contained a reference error bug.
**Action:** Relied on event-driven updates from `TasksService` to maintain counts in `Sprint` entity, and removed the recalculation from the read path. Always verify that "freshness" checks aren't secretly performing expensive writes during reads.

## 2024-05-25 - Metrics Calculation Optimization
**Learning:** Found that `calculateBudgetCostMetrics` was fetching the entire `budgets`, `costs`, and `expenses` tables to calculate sums in memory. This scales linearly with database size (O(N)), causing severe performance degradation.
**Action:** Replaced with `createQueryBuilder` aggregation queries (SUM + GROUP BY) to offload calculation to the database. Always check "statistics" or "metrics" methods for hidden `findAll` calls.
