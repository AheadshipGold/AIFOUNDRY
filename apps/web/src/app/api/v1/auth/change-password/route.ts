import { NextResponse } from 'next/server';
import { extractUserIdFromRequest, changePassword } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Session invalide' }, { status: 401 });
    }
    const body = await req.json();
    const result = await changePassword(userId, body, req.headers);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur lors du changement de mot de passe' }, { status: 400 });
  }
}
