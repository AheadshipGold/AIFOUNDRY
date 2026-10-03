import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { auth } from '../src/auth/better-auth';
import * as assert from 'assert';

const prisma = new PrismaClient();
const prismaService = new PrismaService();
const authService = new AuthService(prismaService);

async function runBetterAuthProofSuite() {
  console.log('====================================================');
  console.log('🧪 OJARKET V3 — BETTER AUTH VERIFICATION SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testEmail = `proof.user.${timestamp}@ojarket.test`;
  const testUsername = `proof_${timestamp.toString().slice(-6)}`;
  const testPassword = 'SecurePassword2026!';
  const testName = 'Test User BetterAuth';

  // STEP 1: Direct Better Auth Native Sign-Up
  console.log('1️⃣ Testing Better Auth Native Sign-Up (Email & Password)...');
  const signUpRes = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: testPassword,
      name: testName,
      username: testUsername,
    },
  });

  assert.ok(signUpRes?.user, 'User object must be returned on sign-up');
  assert.strictEqual(signUpRes.user.email, testEmail, 'Email must match');
  assert.strictEqual(signUpRes.user.username, testUsername, 'Username must match');
  assert.strictEqual(signUpRes.user.role, 'BUYER', 'Default role must be BUYER');
  console.log('  ✅ Native sign-up successful. User ID:', signUpRes.user.id);

  // STEP 2: Sign-In via Email with Better Auth
  console.log('2️⃣ Testing Better Auth Sign-In via Email...');
  const signInEmailRes = await auth.api.signInEmail({
    body: {
      email: testEmail,
      password: testPassword,
    },
  });

  assert.ok(signInEmailRes?.token, 'Token must be issued on email sign-in');
  assert.strictEqual(signInEmailRes.user.email, testEmail);
  console.log('  ✅ Email sign-in successful. Bearer Token generated.');

  // STEP 3: Sign-In via Username with Better Auth
  console.log('3️⃣ Testing Better Auth Sign-In via Username...');
  const signInUsernameRes = await auth.api.signInUsername({
    body: {
      username: testUsername,
      password: testPassword,
    },
  });

  assert.ok(signInUsernameRes?.token, 'Token must be issued on username sign-in');
  assert.strictEqual(signInUsernameRes.user.username, testUsername);
  console.log('  ✅ Username sign-in successful.');

  // STEP 4: Session Retrieval via Bearer Token
  console.log('4️⃣ Testing Session Verification via Bearer Token...');
  const sessionRes = await auth.api.getSession({
    headers: new Headers({
      authorization: `Bearer ${signInUsernameRes.token}`,
    }),
  });

  assert.ok(sessionRes?.session, 'Active session must be retrieved');
  assert.strictEqual(sessionRes.user.id, signUpRes.user.id);
  console.log('  ✅ Session verified successfully for User ID:', sessionRes.user.id);

  // STEP 5: High-Level AuthService Registration & Profile Retrieval (getMe)
  console.log('5️⃣ Testing High-Level AuthService getMe & Profile...');
  const profile = await authService.getMe(signUpRes.user.id);
  assert.strictEqual(profile.email, testEmail);
  assert.strictEqual(profile.role, 'BUYER');
  assert.strictEqual(Array.isArray(profile.shops), true);
  console.log('  ✅ getMe profile resolved with shops and roles.');

  // STEP 6: Update Profile
  console.log('6️⃣ Testing Profile Update (Name & Phone)...');
  const updatedProfile = await authService.updateProfile(signUpRes.user.id, {
    name: 'Amina Diop Updated',
    phone: '+229 97 00 11 22',
  });
  assert.strictEqual(updatedProfile.name, 'Amina Diop Updated');
  assert.strictEqual(updatedProfile.phone, '+229 97 00 11 22');
  console.log('  ✅ Profile updated successfully.');

  // STEP 7: Google OAuth 2.0 Native Sign-In Simulation
  console.log('7️⃣ Testing Google OAuth 2.0 Native Authentication...');
  const googleEmail = `google.proof.${timestamp}@ojarket.test`;
  const googleId = `gid_${timestamp}`;
  const googleAuthRes = await authService.googleAuth({
    email: googleEmail,
    name: 'Google Proof User',
    googleId,
    avatarUrl: 'https://images.unsplash.com/photo-google-avatar.jpg',
  });

  assert.ok(googleAuthRes?.token, 'Session token must be returned for Google sign-in');
  assert.strictEqual(googleAuthRes.user.email, googleEmail);
  
  // Verify that Account record exists for Google
  const googleAccount = await prisma.account.findFirst({
    where: { userId: googleAuthRes.user.id, providerId: 'google' },
  });
  assert.ok(googleAccount, 'Google Account record must be persisted in database');
  assert.strictEqual(googleAccount.accountId, googleId);
  console.log('  ✅ Google OAuth sign-in and Account linkage verified.');

  // STEP 8: Register Artisan Seller Shop
  console.log('8️⃣ Testing Artisan Seller Registration (Role Elevation)...');
  const sellerRegRes = await authService.registerSeller(signUpRes.user.id, {
    shopName: `Atelier Test ${timestamp.toString().slice(-4)}`,
    craftType: 'Maroquinerie & Cuir',
    city: 'Porto-Novo',
    merchantPhone: '+229 97 00 11 22',
  });

  assert.strictEqual(sellerRegRes.success, true);
  const elevatedProfile = await authService.getMe(signUpRes.user.id);
  assert.strictEqual(elevatedProfile.role, 'SELLER');
  assert.strictEqual(elevatedProfile.shops.length, 1);
  assert.strictEqual(elevatedProfile.activeShop?.name, `Atelier Test ${timestamp.toString().slice(-4)}`);
  console.log('  ✅ Artisan Seller registered. Role elevated to SELLER.');

  // STEP 9: Clean Account Deletion
  console.log('9️⃣ Testing Full Account Deletion (GDPR & Cascade Cleaning)...');
  const deleteRes = await authService.deleteAccount(signUpRes.user.id);
  assert.strictEqual(deleteRes.success, true);

  // Clean Google test user
  await authService.deleteAccount(googleAuthRes.user.id);

  // Verify user is gone
  const deletedUser = await prisma.user.findUnique({ where: { id: signUpRes.user.id } });
  assert.strictEqual(deletedUser, null, 'User must be completely deleted from DB');
  console.log('  ✅ Account and all associated data safely deleted.');

  console.log('\n====================================================');
  console.log('🎉 ALL 9 BETTER AUTH VERIFICATION PROOFS PASSED (100%)');
  console.log('====================================================\n');
}

runBetterAuthProofSuite()
  .catch((err) => {
    console.error('❌ Verification suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await prismaService.$disconnect();
  });
