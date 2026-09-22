import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rendre la génération d'UUID indépendante du module « contrib » `uuid-ossp`.
 *
 * TypeORM émet `DEFAULT uuid_generate_v4()` pour toute entité déclarée avec
 * `@PrimaryGeneratedColumn('uuid')` — 19 entités dans ce projet. Or
 * `uuid-ossp` est un module **contrib**, absent de plusieurs distributions
 * PostgreSQL (paquets minimalistes, certaines offres managées). Sans lui, la
 * moindre insertion échoue :
 *
 *   could not access file "uuid-ossp": No such file or directory → HTTP 500
 *
 * PostgreSQL ≥ 13 fournit `gen_random_uuid()` **dans le cœur**. On crée donc
 * l'extension lorsqu'elle est disponible ; sinon on alias
 * `uuid_generate_v4()` vers `gen_random_uuid()`. Le schéma et le code
 * applicatif restent identiques, et le projet démarre sur n'importe quel
 * PostgreSQL ≥ 13.
 *
 * Le test de disponibilité est fait **en TypeScript** et non dans un bloc
 * `DO \$\$ …`, car ce dernier exige l'extension `plpgsql`, elle aussi
 * absente des builds les plus minimalistes.
 */
export class UuidFallback1789145307790 implements MigrationInterface {
  name = 'UuidFallback1789145307790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(
      "SELECT COUNT(*)::int AS count FROM pg_available_extensions WHERE name = 'uuid-ossp'",
    )) as Array<{ count: number }>;

    if ((rows[0]?.count ?? 0) > 0) {
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      return;
    }

    await queryRunner.query(
      "CREATE OR REPLACE FUNCTION uuid_generate_v4() RETURNS uuid AS 'SELECT gen_random_uuid()' LANGUAGE sql VOLATILE",
    );
  }

  public async down(): Promise<void> {
    /* Sans effet volontaire : retirer l'alias casserait les insertions. */
  }
}
