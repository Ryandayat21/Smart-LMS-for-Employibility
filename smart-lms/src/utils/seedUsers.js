import { createUser } from "./firebaseUtils.js";

export const SAMPLE_USERS = [
  {
    displayName: "Admin User",
    email: "admin@example.com",
    role: "admin",
    photoURL: "",
    meta: { imported: true }
  },
  {
    displayName: "Instructor One",
    email: "instructor1@example.com",
    role: "instructor",
    photoURL: "",
    meta: { imported: true }
  },
  {
    displayName: "Student Satu",
    email: "student1@example.com",
    role: "user",
    photoURL: "",
    meta: { imported: true }
  },
  {
    displayName: "Student Dua",
    email: "student2@example.com",
    role: "user",
    photoURL: "",
    meta: { imported: true }
  }
];

export async function seedUsers(overwrite = false) {
  for (const u of SAMPLE_USERS) {
    const payload = {
      displayName: u.displayName,
      email: u.email,
      role: u.role || "user",
      photoURL: u.photoURL || "",
      createdAt: new Date(),
      ...u.meta
    };
    try {
      await createUser(payload);
      // eslint-disable-next-line no-console
      console.log("Created user:", payload.email);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create user", payload.email, err.message || err);
    }
  }
}

// If this file is executed directly with node, run the seeder once
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
    (async () => {
      try {
        // eslint-disable-next-line no-console
        console.log("Seeding users...");
        await seedUsers();
        // eslint-disable-next-line no-console
        console.log("Seeding finished.");
        process.exit(0);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
      }
    })();
  }
}
