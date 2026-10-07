import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await loginUser(body, Object.fromEntries(req.headers));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Identifiant ou mot de passe incorrect' }, { status: 400 });
  }
}
