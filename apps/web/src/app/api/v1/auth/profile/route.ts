import { NextResponse } from 'next/server';
import { extractUserIdFromRequest, updateProfile } from '@/lib/server/auth';

export async function PUT(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Session invalide' }, { status: 401 });
    }
    const body = await req.json();
    const updated = await updateProfile(userId, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur de mise à jour' }, { status: 400 });
  }
}
