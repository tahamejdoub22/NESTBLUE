import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSprintIdToTasks1766329630650 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column already exists
    const table = await queryRunner.getTable("tasks");
    const sprintIdColumn = table?.findColumnByName("sprintId");

    if (!sprintIdColumn) {
      await queryRunner.addColumn(
        "tasks",
        new TableColumn({
          name: "sprintId",
          type: "uuid",
          isNullable: true,
        }),
      );

      // Add foreign key constraint
      await queryRunner.query(`
        ALTER TABLE "tasks" 
        ADD CONSTRAINT "FK_tasks_sprintId" 
        FOREIGN KEY ("sprintId") 
        REFERENCES "sprints"("id") 
        ON DELETE SET NULL 
        ON UPDATE NO ACTION
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint first
    const table = await queryRunner.getTable("tasks");
    if (!table) return;

    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("sprintId") !== -1,
    );

    if (foreignKey) {
      try {
        await queryRunner.dropForeignKey("tasks", foreignKey);
      } catch (error) {
        // Constraint might not exist, ignore error
        console.warn("Foreign key constraint might not exist:", error);
      }
    }

    // Drop the column
    const sprintIdColumn = table.findColumnByName("sprintId");
    if (sprintIdColumn) {
      await queryRunner.dropColumn("tasks", "sprintId");
    }
  }
}
