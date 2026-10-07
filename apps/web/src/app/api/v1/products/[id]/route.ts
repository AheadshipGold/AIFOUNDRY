import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/server/catalog';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id);
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Produit introuvable' }, { status: 404 });
  }
}
