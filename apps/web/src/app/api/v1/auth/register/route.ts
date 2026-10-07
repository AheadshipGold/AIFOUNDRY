import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body, Object.fromEntries(req.headers));
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur lors de l\'inscription' }, { status: 400 });
  }
}
