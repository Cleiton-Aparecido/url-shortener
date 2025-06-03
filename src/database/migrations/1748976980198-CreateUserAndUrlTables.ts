import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndUrlTables1748976980198 implements MigrationInterface {
    name = 'CreateUserAndUrlTables1748976980198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "url" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalUrl" character varying NOT NULL, "shortCode" character varying NOT NULL, "clickCount" integer NOT NULL DEFAULT '0', "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_df4aaf7b2c247152f3e92fe7c78" UNIQUE ("shortCode"), CONSTRAINT "PK_7421088122ee64b55556dfc3a91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "url" ADD CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "url" DROP CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb"`);
        await queryRunner.query(`DROP TABLE "url"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
