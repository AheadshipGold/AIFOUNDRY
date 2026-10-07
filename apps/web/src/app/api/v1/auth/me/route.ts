import { NextResponse } from 'next/server';
import { extractUserIdFromRequest, getMe } from '@/lib/server/auth';

export async function GET(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Session invalide ou utilisateur non authentifié' }, { status: 401 });
    }
    const profile = await getMe(userId);
    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
