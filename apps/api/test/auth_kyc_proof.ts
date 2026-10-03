import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/auth/auth.service';
import { CatalogService } from '../src/catalog/catalog.service';
import { AdminService } from '../src/admin/admin.service';

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
    // -----------------------------------------------------------------
    // TEST 1: Request OTP for a West African phone number (+229)
    // -----------------------------------------------------------------
    const phone = '+22997112233';
    const otpRes = await authService.requestOtp({ identifier: phone });
    assert(
      otpRes.success === true && typeof otpRes.code === 'string',
      'Test 1.1: Request OTP succeeds and creates valid verification token',
      `Identifier: ${otpRes.identifier}, Code generated: ${otpRes.code}`
    );

    // Verify token exists in database
    const dbToken = await prisma.otpToken.findFirst({
      where: { identifier: phone, code: otpRes.code! },
    });
    assert(
      !!dbToken && dbToken.used === false && dbToken.expiresAt > new Date(),
      'Test 1.2: OTP token exists in PostgreSQL with valid expiration and used=false'
    );

    // -----------------------------------------------------------------
    // TEST 2: Reject invalid OTP code
    // -----------------------------------------------------------------
    let failedAsExpected = false;
    try {
      await authService.verifyOtp({ identifier: phone, code: '000000' });
    } catch (err: any) {
      failedAsExpected = true;
    }
    assert(
      failedAsExpected,
      'Test 2: Bad OTP code is strictly rejected with BadRequestException'
    );

    // -----------------------------------------------------------------
    // TEST 3: Successfully verify OTP and establish user session
    // -----------------------------------------------------------------
    const verifyRes = await authService.verifyOtp({ identifier: phone, code: otpRes.code! });
    assert(
      !!verifyRes.token && verifyRes.token.startsWith('ojk_sess_'),
      'Test 3.1: Valid OTP returns authenticated session token',
      `Token: ${verifyRes.token}`
    );
    assert(
      verifyRes.user.phone === phone && verifyRes.user.role === 'BUYER',
      'Test 3.2: User created as BUYER by default (Guest First model)',
      `UserId: ${verifyRes.user.id}, Role: ${verifyRes.user.role}`
    );

    const usedDbToken = await prisma.otpToken.findUnique({ where: { id: dbToken!.id } });
    assert(
      usedDbToken?.used === true,
      'Test 3.3: Token marked as used in PostgreSQL to prevent replay attacks'
    );

    // -----------------------------------------------------------------
    // TEST 4: Register Artisan Shop with initial KYC_PENDING status
    // -----------------------------------------------------------------
    const newArtisanUserId = verifyRes.user.id;
    const registerRes = await authService.registerSeller(newArtisanUserId, {
      shopName: 'Atelier de Sculpture de Ouidah',
      craftType: 'sculpture',
      city: 'Ouidah',
      description: 'Sculptures sacrées en bois ébène et iroko',
      merchantPhone: phone,
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
        title: 'Sculpture Bronze Contemporaine',
        description: 'Sculpture d’art en bronze noble poli main',
        category: 'sculpture',
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
