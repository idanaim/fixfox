import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1751182200000 implements MigrationInterface {
    name = 'CreateNotificationTable1751182200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create notification type enum
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('issue_assigned', 'issue_status_changed', 'issue_comment', 'issue_escalated', 'issue_resolved', 'issue_overdue')`);
        
        // Create notification status enum
        await queryRunner.query(`CREATE TYPE "public"."notification_status_enum" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed')`);
        
        // Create notification channels enum
        await queryRunner.query(`CREATE TYPE "public"."notification_channels_enum" AS ENUM('push', 'email', 'sms', 'in_app')`);
        
        // Create notification table
        await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" SERIAL NOT NULL, 
                "type" "public"."notification_type_enum" NOT NULL, 
                "title" character varying NOT NULL, 
                "message" text NOT NULL, 
                "status" "public"."notification_status_enum" NOT NULL DEFAULT 'pending', 
                "channels" "public"."notification_channels_enum" array NOT NULL DEFAULT '{push,in_app}', 
                "data" jsonb, 
                "pushToken" character varying, 
                "sentAt" TIMESTAMP, 
                "deliveredAt" TIMESTAMP, 
                "readAt" TIMESTAMP, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "userId" integer, 
                "businessId" integer, 
                "issueId" integer, 
                CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_business" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_issue" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        // Add indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_notification_user" ON "notification" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_business" ON "notification" ("businessId")`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status" ON "notification" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_created_at" ON "notification" ("createdAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_business"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_user"`);
        
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_issue"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_business"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_user"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "notification"`);
        
        // Drop enums
        await queryRunner.query(`DROP TYPE "public"."notification_channels_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    }
} 