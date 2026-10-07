import { NextResponse } from 'next/server';
import { googleAuth } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await googleAuth(body, Object.fromEntries(req.headers));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur d\'authentification Google' }, { status: 400 });
  }
}
