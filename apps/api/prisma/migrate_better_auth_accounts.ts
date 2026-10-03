import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Better Auth Data Migration & Backfill ---');
  
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      sessions: true,
    },
  });

  console.log(`Found ${users.length} total users in PostgreSQL database.`);

  for (const user of users) {
    console.log(`Processing user: ${user.email} (${user.id})`);

    // 1. Sync User standard fields for Better Auth
    const cleanUsername = user.username ? user.username.replace(/^@+/, '') : null;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: user.emailVerified || user.isEmailVerified || true,
        displayUsername: user.displayUsername || cleanUsername || user.name,
        username: cleanUsername,
      },
    });

    // 2. Google OAuth Account backfill
    if (user.googleId) {
      const existingGoogleAccount = user.accounts.find((a) => a.providerId === 'google');
      if (!existingGoogleAccount) {
        console.log(`  + Creating 'google' Account for ${user.email}`);
        await prisma.account.create({
          data: {
            userId: user.id,
            accountId: user.googleId,
            providerId: 'google',
          },
        });
      }
    }

    // 3. Credential (Email & Password) Account backfill
    if (user.passwordHash) {
      const existingCredentialAccount = user.accounts.find((a) => a.providerId === 'credential');
      if (!existingCredentialAccount) {
        console.log(`  + Creating 'credential' Account for ${user.email}`);
        await prisma.account.create({
          data: {
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            password: user.passwordHash,
          },
        });
      }
    }
  }

  console.log('--- Migration & Backfill Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
