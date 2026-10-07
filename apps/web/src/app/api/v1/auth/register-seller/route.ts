import { NextResponse } from 'next/server';
import { extractUserIdFromRequest, registerSeller } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentification requise pour enregistrer une boutique' }, { status: 401 });
    }
    const body = await req.json();
    const result = await registerSeller(userId, body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur lors de la création de la boutique' }, { status: 400 });
  }
}
