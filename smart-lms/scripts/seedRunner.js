import { seedUsers } from "../src/utils/seedUsers.js";

(async () => {
  try {
    console.log('Running seed runner...');
    await seedUsers();
    console.log('Seeder finished.');
    process.exit(0);
  } catch (err) {
    console.error('Seeder failed:', err);
    process.exit(1);
  }
})();
