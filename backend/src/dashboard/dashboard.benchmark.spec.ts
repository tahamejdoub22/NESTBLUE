import { Sprint } from "../sprints/entities/sprint.entity";

// Mock SprintsRepository
class MockSprintsRepository {
  async update(id: string, data: Partial<Sprint>) {
    // Simulate DB latency
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { affected: 1 };
  }
}

describe("Dashboard Performance Benchmark", () => {
  const repository = new MockSprintsRepository();
  const sprintCount = 50;
  let sprints: any[];
  let countMap: Map<string, { count: number; completedCount: number }>;

  beforeEach(() => {
    sprints = Array.from({ length: sprintCount }, (_, i) => ({
      id: `sprint-${i}`,
      taskCount: 0,
      completedTaskCount: 0,
    }));

    countMap = new Map();
    // Simulate that all sprints need updates
    sprints.forEach((s) => {
      countMap.set(s.id, { count: 10, completedCount: 5 });
    });
  });

  test("Baseline: Serial Updates", async () => {
    const start = Date.now();

    for (const sprint of sprints) {
      const stats = countMap.get(sprint.id) || {
        count: 0,
        completedCount: 0,
      };

      if (
        sprint.taskCount !== stats.count ||
        sprint.completedTaskCount !== stats.completedCount
      ) {
        sprint.taskCount = stats.count;
        sprint.completedTaskCount = stats.completedCount;

        // Simulate the await inside the loop
        await repository.update(sprint.id, {
          taskCount: sprint.taskCount,
          completedTaskCount: sprint.completedTaskCount,
        });
      }
    }

    const duration = Date.now() - start;
    console.log(`Baseline (Serial) Time: ${duration}ms`);
    // Expectation: ~50 * 10ms = 500ms
    expect(duration).toBeGreaterThanOrEqual(400);
  });

  test("Optimized: Parallel Updates", async () => {
    const start = Date.now();

    const updatePromises = [];

    for (const sprint of sprints) {
      const stats = countMap.get(sprint.id) || {
        count: 0,
        completedCount: 0,
      };

      if (
        sprint.taskCount !== stats.count ||
        sprint.completedTaskCount !== stats.completedCount
      ) {
        sprint.taskCount = stats.count;
        sprint.completedTaskCount = stats.completedCount;

        // Push the promise to array
        updatePromises.push(
          repository.update(sprint.id, {
            taskCount: sprint.taskCount,
            completedTaskCount: sprint.completedTaskCount,
          }),
        );
      }
    }

    await Promise.all(updatePromises);

    const duration = Date.now() - start;
    console.log(`Optimized (Parallel) Time: ${duration}ms`);
    // Expectation: ~10ms (parallel execution)
    expect(duration).toBeLessThan(100);
  });
});
