import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateRestaurantUsers1659462566931 implements MigrationInterface {
    name = 'CreateRestaurantUsers1659462566931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "opening_hours" (
                "id" SERIAL NOT NULL,
                "week_name" character varying NOT NULL,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "restaurant_id" integer,
                CONSTRAINT "PK_09415e2b345103b1f5971464f85" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "restaurant" (
                "id" SERIAL NOT NULL,
                "cash_balance" double precision NOT NULL,
                "restaurant_name" character varying NOT NULL,
                CONSTRAINT "PK_649e250d8b8165cb406d99aa30f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "menu" (
                "id" SERIAL NOT NULL,
                "dish_name" character varying NOT NULL,
                "price" double precision NOT NULL,
                "restaurant_id" integer,
                CONSTRAINT "PK_35b2a8f47d153ff7a41860cceeb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "username" character varying,
                "name" character varying,
                "role" character varying(30) NOT NULL DEFAULT 'STANDARD',
                "language" character varying(15) NOT NULL DEFAULT 'en-US',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "cash_balance" double precision NOT NULL,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "purchase_history" (
                "id" SERIAL NOT NULL,
                "dish_name" character varying NOT NULL,
                "restaurant_name" character varying NOT NULL,
                "transaction_amount" double precision NOT NULL,
                "transaction_date" character varying NOT NULL,
                "user_id" integer,
                CONSTRAINT "PK_e5426ccc10998593a2714764ec6" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "opening_hours"
            ADD CONSTRAINT "FK_07df934a54a9efa05de6089546a" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "menu"
            ADD CONSTRAINT "FK_a9c5473205703022c7a53a410c2" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "purchase_history"
            ADD CONSTRAINT "FK_cfdb4ec047df3779d8637f6eb78" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "purchase_history" DROP CONSTRAINT "FK_cfdb4ec047df3779d8637f6eb78"
        `);
        await queryRunner.query(`
            ALTER TABLE "menu" DROP CONSTRAINT "FK_a9c5473205703022c7a53a410c2"
        `);
        await queryRunner.query(`
            ALTER TABLE "opening_hours" DROP CONSTRAINT "FK_07df934a54a9efa05de6089546a"
        `);
        await queryRunner.query(`
            DROP TABLE "purchase_history"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "menu"
        `);
        await queryRunner.query(`
            DROP TABLE "restaurant"
        `);
        await queryRunner.query(`
            DROP TABLE "opening_hours"
        `);
    }

}
