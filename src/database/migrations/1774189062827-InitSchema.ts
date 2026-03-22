import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1774189062827 implements MigrationInterface {
    name = 'InitSchema1774189062827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "portfolios" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "skills" text array NOT NULL,
                "views" integer NOT NULL DEFAULT '0',
                "downloads" integer NOT NULL DEFAULT '0',
                "likes" integer NOT NULL DEFAULT '0',
                "createdDate" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_488aa6e9b219d1d9087126871ae" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."companies_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')
        `);
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "sector" character varying NOT NULL,
                "logo" character varying,
                "cover_image" character varying,
                "about" text,
                "website" character varying,
                "creation_date" date,
                "partnership_date" date NOT NULL,
                "company_size" character varying,
                "social_links" text,
                "country" character varying,
                "headquarters" character varying,
                "location" character varying,
                "phone" character varying,
                "email" character varying,
                "status" "public"."companies_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."job_offers_type_enum" AS ENUM(
                'CDI',
                'CDD',
                'STAGE',
                'ALTERNANCE',
                'FREELANCE',
                'TEMPS_PARTIEL'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."job_offers_experience_enum" AS ENUM(
                'CDI',
                'CDD',
                'STAGE',
                'ALTERNANCE',
                'FREELANCE',
                'TEMPS_PARTIEL'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."job_offers_status_enum" AS ENUM('ACTIVE', 'CLOSED', 'DRAFT')
        `);
        await queryRunner.query(`
            CREATE TABLE "job_offers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "location" character varying NOT NULL,
                "type" "public"."job_offers_type_enum" NOT NULL,
                "experience" "public"."job_offers_experience_enum" NOT NULL,
                "salary" character varying NOT NULL,
                "description" text NOT NULL,
                "benefits" text NOT NULL,
                "requirements" text array NOT NULL,
                "status" "public"."job_offers_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "publish_date" date NOT NULL,
                "end_date" date NOT NULL,
                "applicants" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "companyId" uuid,
                CONSTRAINT "PK_9a54d36bd6829979f945defdeb5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."candidatures_status_enum" AS ENUM('EN_ATTENTE', 'EN_COURS', 'APPROUVEE', 'REJETEE')
        `);
        await queryRunner.query(`
            CREATE TABLE "candidatures" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "candidate_name" character varying NOT NULL,
                "candidate_email" character varying NOT NULL,
                "status" "public"."candidatures_status_enum" NOT NULL DEFAULT 'EN_ATTENTE',
                "score" integer NOT NULL DEFAULT '0',
                "applied_date" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "jobOfferId" uuid,
                CONSTRAINT "PK_3d3816f972665a5f0b67e0fbf7d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER', 'ENTREPRISE')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER',
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "avatar" character varying,
                "registration_date" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "companyId" uuid,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."calendar_events_type_enum" AS ENUM('ENTRETIEN', 'FORMATION', 'REUNION')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."calendar_events_status_enum" AS ENUM('CONFIRMED', 'PENDING', 'CANCELLED')
        `);
        await queryRunner.query(`
            CREATE TABLE "calendar_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "type" "public"."calendar_events_type_enum" NOT NULL,
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP NOT NULL,
                "participants" text array NOT NULL,
                "location" character varying,
                "status" "public"."calendar_events_status_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."scoring_results_status_enum" AS ENUM('COMPLETED', 'IN_PROGRESS')
        `);
        await queryRunner.query(`
            CREATE TABLE "scoring_results" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "candidate_name" character varying NOT NULL,
                "candidate_email" character varying NOT NULL,
                "position" character varying NOT NULL,
                "overall_score" integer NOT NULL,
                "criteria" jsonb NOT NULL,
                "analysisDate" TIMESTAMP NOT NULL,
                "status" "public"."scoring_results_status_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_19e60e97a34400ab03b52250390" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."matching_results_status_enum" AS ENUM('NOUVEAU', 'EN_COURS', 'FINALISE')
        `);
        await queryRunner.query(`
            CREATE TABLE "matching_results" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "candidate_name" character varying NOT NULL,
                "candidate_email" character varying NOT NULL,
                "position" character varying NOT NULL,
                "company" character varying NOT NULL,
                "matching_score" integer NOT NULL,
                "status" "public"."matching_results_status_enum" NOT NULL DEFAULT 'NOUVEAU',
                "match_date" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b07e8c6d91d2c0b18be23abcb5c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."interview_sessions_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'SCHEDULED')
        `);
        await queryRunner.query(`
            CREATE TABLE "interview_sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "candidate_name" character varying NOT NULL,
                "candidate_email" character varying NOT NULL,
                "position" character varying NOT NULL,
                "duration" integer NOT NULL,
                "score" integer NOT NULL,
                "status" "public"."interview_sessions_status_enum" NOT NULL,
                "start_time" TIMESTAMP NOT NULL,
                "feedback" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8289f4ee665d0b5e283345db49a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."cv_analysis_status_enum" AS ENUM('ANALYZING', 'COMPLETED', 'FAILED')
        `);
        await queryRunner.query(`
            CREATE TABLE "cv_analysis" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "filename" character varying NOT NULL,
                "analysis_score" integer NOT NULL,
                "recommendations" text array NOT NULL,
                "upload_date" TIMESTAMP NOT NULL,
                "status" "public"."cv_analysis_status_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c20584b4524a3dd9d5ee17883e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "portfolios"
            ADD CONSTRAINT "FK_e4e66691a2634fcf5525e33ecf5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "job_offers"
            ADD CONSTRAINT "FK_b83b3a5272682cf82586222909f" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "candidatures"
            ADD CONSTRAINT "FK_749db0b1ea12f53c82f34f02169" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "candidatures"
            ADD CONSTRAINT "FK_0926a5c7c58fb304cd22ef32a4a" FOREIGN KEY ("jobOfferId") REFERENCES "job_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_6f9395c9037632a31107c8a9e58"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidatures" DROP CONSTRAINT "FK_0926a5c7c58fb304cd22ef32a4a"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidatures" DROP CONSTRAINT "FK_749db0b1ea12f53c82f34f02169"
        `);
        await queryRunner.query(`
            ALTER TABLE "job_offers" DROP CONSTRAINT "FK_b83b3a5272682cf82586222909f"
        `);
        await queryRunner.query(`
            ALTER TABLE "portfolios" DROP CONSTRAINT "FK_e4e66691a2634fcf5525e33ecf5"
        `);
        await queryRunner.query(`
            DROP TABLE "cv_analysis"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."cv_analysis_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "interview_sessions"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."interview_sessions_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "matching_results"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."matching_results_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "scoring_results"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."scoring_results_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "calendar_events"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."calendar_events_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."calendar_events_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "candidatures"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."candidatures_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "job_offers"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."job_offers_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."job_offers_experience_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."job_offers_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "companies"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."companies_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "portfolios"
        `);
    }

}
