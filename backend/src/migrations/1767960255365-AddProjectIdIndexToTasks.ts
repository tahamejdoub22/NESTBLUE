import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectIdIndexToTasks1767960255365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_projectId" ON "tasks" ("projectId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tasks_projectId"`);
  }
}
