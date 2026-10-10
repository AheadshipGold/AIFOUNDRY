import { NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { createReview } from '@/lib/server/engagement';

export async function POST(req: Request) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ message: 'Authentification requise' }, { status: 401 });
  try {
    const body = await req.json();
    const review = await createReview(userId, body);
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Impossible de publier l’avis' }, { status: 400 });
  }
}
