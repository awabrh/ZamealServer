import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1673906715499 implements MigrationInterface {
    name = 'initial1673906715499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" text NOT NULL, "confirmed" boolean NOT NULL DEFAULT false, "name" character varying, "uni" character varying DEFAULT 'University Of Khartoum', "college" character varying, "dep" character varying, "batch" character varying, "address" character varying, "mobile" character varying, "gender" character varying, "password" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "carModel" text NOT NULL, "imageId" text NOT NULL, "numberOfSeats" integer NOT NULL, "isAcWorking" boolean NOT NULL, "locations" text NOT NULL, "price" text NOT NULL, "departure" character varying NOT NULL, "arrival" character varying NOT NULL, "days" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_5c1cf55c308037b5aca1038a13" UNIQUE ("userId"), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_5c1cf55c308037b5aca1038a131"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
