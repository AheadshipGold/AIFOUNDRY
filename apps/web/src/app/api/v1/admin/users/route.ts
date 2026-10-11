import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 });
    }

    // 1. Fetch from prisma.user with role: 'ADMIN'
    const dbAdminUsers = await prisma.user.findMany({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { email: { contains: 'damacarre@gmail.com' } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Fetch from prisma.adminUser
    const platformAdmins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const seenEmails = new Set<string>();
    const result: any[] = [];

    // Always put Abraham B. A. / Platform Owner at the very top
    for (const u of dbAdminUsers) {
      const emailLower = u.email.toLowerCase();
      if (!seenEmails.has(emailLower)) {
        seenEmails.add(emailLower);
        const isOwner = emailLower.includes('damacarre') || (u.name && u.name.toLowerCase().includes('abraham'));
        result.push({
          id: u.id,
          email: u.email,
          name: u.name || 'Administrateur',
          role: isOwner ? 'PLATFORM_OWNER' : 'ADMIN',
          createdAt: u.createdAt.toISOString(),
          isActive: true,
        });
      }
    }

    for (const pa of platformAdmins) {
      const emailLower = pa.email.toLowerCase();
      if (!seenEmails.has(emailLower)) {
        seenEmails.add(emailLower);
        result.push({
          id: pa.id,
          email: pa.email,
          name: pa.name,
          role: pa.role || 'ADMIN',
          createdAt: pa.createdAt.toISOString(),
          isActive: true,
        });
      }
    }

    // Sort so PLATFORM_OWNER is first
    result.sort((a, b) => {
      if (a.role === 'PLATFORM_OWNER') return -1;
      if (b.role === 'PLATFORM_OWNER') return 1;
      return 0;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handlePromote(req);
}

export async function PATCH(req: NextRequest) {
  return handlePromote(req);
}

async function handlePromote(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Adresse email valide requise' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'ADMIN',
          ...(name && name.trim() ? { name: name.trim() } : {}),
        },
      });
    }

    // Also ensure presence in adminUser for platform logs
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!existingAdmin) {
      await prisma.adminUser.create({
        data: {
          email: cleanEmail,
          name: name?.trim() || existingUser?.name || 'Administrateur',
          role: 'OPERATIONS_ADMIN',
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `L'utilisateur ${cleanEmail} a été promu administrateur avec succès.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetEmail = searchParams.get('email')?.trim().toLowerCase() || '';
    const targetId = searchParams.get('id')?.trim() || '';

    if (!targetEmail && !targetId) {
      return NextResponse.json({ error: 'Email ou ID requis' }, { status: 400 });
    }

    if (targetEmail.includes('damacarre') || targetId === user.id || (targetEmail && targetEmail === user.email?.toLowerCase())) {
      return NextResponse.json(
        { error: 'Action interdite : vous ne pouvez pas destituer le propriétaire souverain de la plateforme.' },
        { status: 403 }
      );
    }

    // 1. Revert user in User table to BUYER
    if (targetEmail) {
      await prisma.user.updateMany({
        where: { email: targetEmail },
        data: { role: 'BUYER' },
      });
      await prisma.adminUser.deleteMany({
        where: { email: targetEmail },
      });
    }

    if (targetId) {
      await prisma.user.updateMany({
        where: { id: targetId },
        data: { role: 'BUYER' },
      });
      await prisma.adminUser.deleteMany({
        where: { id: targetId },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrateur destitué avec succès.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
