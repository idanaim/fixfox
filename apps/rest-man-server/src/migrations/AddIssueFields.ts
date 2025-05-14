import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIssueFields1712345678901 implements MigrationInterface {
  name = 'AddIssueFields1712345678901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing fields to issue table
    await queryRunner.query(`
      ALTER TABLE "issue" 
        ADD COLUMN IF NOT EXISTS "symptoms" TEXT,
        ADD COLUMN IF NOT EXISTS "cause" TEXT,
        ADD COLUMN IF NOT EXISTS "treatment" TEXT,
        ADD COLUMN IF NOT EXISTS "cost" DECIMAL(10, 2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns in case of rollback
    await queryRunner.query(`
      ALTER TABLE "issue" 
        DROP COLUMN IF EXISTS "symptoms",
        DROP COLUMN IF EXISTS "cause",
        DROP COLUMN IF EXISTS "treatment",
        DROP COLUMN IF EXISTS "cost"
    `);
  }
} 