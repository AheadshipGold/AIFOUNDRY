import { NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { toggleFavorite } from '@/lib/server/engagement';

export async function POST(req: Request, { params }: { params: { productId: string } }) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ message: 'Connectez-vous pour enregistrer vos coups de cœur' }, { status: 401 });
  try {
    return NextResponse.json(await toggleFavorite(userId, params.productId));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur favoris' }, { status: 400 });
  }
}
