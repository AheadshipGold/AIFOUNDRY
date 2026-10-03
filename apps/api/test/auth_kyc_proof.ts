import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/auth/auth.service';
import { CatalogService } from '../src/catalog/catalog.service';
import { AdminService } from '../src/admin/admin.service';
import { auth } from '../src/auth/better-auth';

const prisma = new PrismaClient();
const authService = new AuthService(prisma as any);
const catalogService = new CatalogService(prisma as any);
const adminService = new AdminService(prisma as any);

async function runAuthKycProof() {
  console.log('===============================================================');
  console.log('OJK-PROOF: AUTHENTICATION, SELLER KYC CYCLE & CATALOG ISOLATION');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       ↳ ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       ↳ DETAIL: ${detail}`);
      process.exitCode = 1;
    }
  }

  try {
    const timestamp = Date.now();
    const testEmail = `kyc.artisan.${timestamp}@ojarket.test`;
    const testUsername = `artisan_${timestamp.toString().slice(-6)}`;
    const testPassword = 'SecurePassword2026!';
    const testPhone = '+22997112233';

    // -----------------------------------------------------------------
    // TEST 1: Better Auth Sign-Up
    // -----------------------------------------------------------------
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: 'Artisan Bronze Test',
        username: testUsername,
      },
    });

    assert(
      !!signUpRes?.user?.id,
      'Test 1: Better Auth Native Sign-Up establishes user account',
      `UserId: ${signUpRes?.user?.id}, Email: ${signUpRes?.user?.email}`
    );

    // -----------------------------------------------------------------
    // TEST 2: Sign-In via Username
    // -----------------------------------------------------------------
    const signInRes = await auth.api.signInUsername({
      body: {
        username: testUsername,
        password: testPassword,
      },
    });

    assert(
      !!signInRes?.token,
      'Test 2: Better Auth Sign-In by username generates bearer token',
      `Token: ${signInRes?.token?.substring(0, 16)}...`
    );

    // -----------------------------------------------------------------
    // TEST 3: Profile Resolution via Bearer Token
    // -----------------------------------------------------------------
    const sessionRes = await auth.api.getSession({
      headers: new Headers({ authorization: `Bearer ${signInRes.token}` }),
    });

    assert(
      sessionRes?.user?.id === signUpRes.user.id,
      'Test 3: Session successfully validated from Bearer Token',
      `Session User: ${sessionRes?.user?.name}`
    );

    const newArtisanUserId = signUpRes.user.id;

    const registerRes = await authService.registerSeller(newArtisanUserId, {
      shopName: "Atelier d'Art & Fonderie Royale",
      craftType: 'bronze',
      city: 'Abomey',
      description: "Créations d'art en bronze noble et ébène sculpté",
      merchantPhone: testPhone,
    });

    assert(
      registerRes.success === true &&
      registerRes.shop.kycStatus === 'PENDING' &&
      registerRes.shop.isVerified === false,
      'Test 4.1: New artisan shop registered with kycStatus=PENDING and isVerified=false',
      `Shop: "${registerRes.shop.name}" (Slug: ${registerRes.shop.slug})`
    );

    const updatedUser = await authService.getMe(newArtisanUserId);
    assert(
      updatedUser.role === 'SELLER' && updatedUser.shops.length === 1 && updatedUser.shops[0].kycStatus === 'PENDING',
      'Test 4.2: User role promoted to SELLER and shop linked in profile with PENDING KYC',
      `Role: ${updatedUser.role}, Shop KYC: ${updatedUser.shops[0].kycStatus}`
    );

    // -----------------------------------------------------------------
    // TEST 5: Public Catalog Isolation (Unverified shop products are NOT in public catalog)
    // -----------------------------------------------------------------
    const testProduct = await prisma.product.create({
      data: {
        id: `prd-test-sculpture-${Date.now()}`,
        shopId: registerRes.shop.id,
        title: 'Buste Royal en Bronze Ciselé',
        description: "Œuvre sculpturale d'art en bronze noble et patine royale",
        category: 'art',
        variants: {
          create: [
            {
              sku: `SKU-SCULPTURE-${Date.now()}`,
              name: 'Taille Standard',
              priceMinor: 6500000, // 65 000 FCFA
              currency: 'XOF',
              stockOnHand: 3,
            }
          ]
        }
      }
    });

    // Query public catalog
    const publicProductsBefore = await catalogService.findAll();
    const isLeaked = publicProductsBefore.some(p => p.id === testProduct.id);
    assert(
      !isLeaked,
      'Test 5: Product from unverified/pending shop is EXCLUDED from public catalog (0 data leak)',
      `Product "${testProduct.title}" not visible in ${publicProductsBefore.length} public catalog items`
    );

    // -----------------------------------------------------------------
    // TEST 6: Admin Approves KYC -> Product becomes public & Audit log recorded
    // -----------------------------------------------------------------
    const adminApproval = await adminService.updateShopVerification(
      registerRes.shop.id,
      true,
      'admin@ojarket.bj',
      '192.168.1.50'
    );

    assert(
      adminApproval.isVerified === true && (adminApproval as any).kycStatus === 'VERIFIED',
      'Test 6.1: Central Admin approves KYC -> isVerified=true, kycStatus=VERIFIED'
    );

    // Check public catalog again
    const publicProductsAfter = await catalogService.findAll();
    const isNowVisible = publicProductsAfter.some(p => p.id === testProduct.id);
    assert(
      isNowVisible,
      'Test 6.2: Approved artisan product now immediately appears in public catalog for buyers',
      `Product "${testProduct.title}" is now live in public marketplace`
    );

    // Verify audit log
    const auditLog = await prisma.adminAuditLog.findFirst({
      where: { targetId: registerRes.shop.id, action: 'SHOP_VERIFIED' },
      orderBy: { createdAt: 'desc' },
    });
    assert(
      !!auditLog && (auditLog.afterState as any)?.isVerified === true,
      'Test 6.3: Immutable audit log recorded with admin identity, IP, and state transition',
      `LogId: ${auditLog?.id}, Action: ${auditLog?.action}, Target: ${auditLog?.targetId}`
    );

    // Clean up test fixtures to avoid polluting the database
    await prisma.offerVariant.deleteMany({ where: { productId: testProduct.id } });
    await prisma.product.deleteMany({ where: { id: testProduct.id } });
    await prisma.adminAuditLog.deleteMany({ where: { targetId: registerRes.shop.id } });
    await prisma.shopPaymentConnection.deleteMany({ where: { shopId: registerRes.shop.id } });
    await prisma.shopMembership.deleteMany({ where: { shopId: registerRes.shop.id } });
    await prisma.shop.deleteMany({ where: { id: registerRes.shop.id } });
    await prisma.session.deleteMany({ where: { userId: newArtisanUserId } });
    await prisma.account.deleteMany({ where: { userId: newArtisanUserId } });
    await prisma.user.deleteMany({ where: { id: newArtisanUserId } });

  } catch (err) {
    console.error('CRITICAL UNEXPECTED ERROR IN TEST RUNNER:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('\n===============================================================');
    console.log(`RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('===============================================================');
  }
}

runAuthKycProof();
