import { NextRequest, NextResponse } from 'next/server';
import { handleMonerooWebhook } from '@/lib/server/moneroo';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-moneroo-signature') || req.headers.get('moneroo-signature') || '';
    const result = await handleMonerooWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
