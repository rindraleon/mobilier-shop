import { AppDataSource } from '../data-source';
import { runSeed, SEED_PASSWORD } from './initial.seed';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    await runSeed(AppDataSource);
    // eslint-disable-next-line no-console
    console.log('\n  Seed terminé.\n');
    // eslint-disable-next-line no-console
    console.log(`  Mot de passe commun (démo) : ${SEED_PASSWORD}\n`);
    // eslint-disable-next-line no-console
    console.log('  admin      → admin@example.local      (admin)');
    // eslint-disable-next-line no-console
    console.log('  seller     → seller@example.local     (vendeur approuvé)');
    // eslint-disable-next-line no-console
    console.log('  seller2    → seller2@example.local    (vendeur approuvé)');
    // eslint-disable-next-line no-console
    console.log('  pending    → pending@example.local    (demande en attente)');
    // eslint-disable-next-line no-console
    console.log('  customer   → customer@example.local   (client)\n');
  } finally {
    await AppDataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seed échoué :', error);
  process.exit(1);
});
