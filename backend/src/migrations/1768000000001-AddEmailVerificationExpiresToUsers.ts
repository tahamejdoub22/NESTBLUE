import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailVerificationExpiresToUsers1768000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "emailVerificationExpires",
        type: "timestamptz",
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "emailVerificationExpires");
  }
}
