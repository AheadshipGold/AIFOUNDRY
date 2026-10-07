import { NextResponse } from 'next/server';
import { getPurchaseRequests, createPurchaseRequest } from '@/lib/server/requests';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function GET(req: Request) {
  const userId = await extractUserIdFromRequest(req);
  try {
    const requests = await getPurchaseRequests(userId || undefined);
    return NextResponse.json(requests);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur demandes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const body = await req.json();
    const result = await createPurchaseRequest({ ...body, buyerId: userId || body.buyerId });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur création demande' }, { status: 400 });
  }
}
