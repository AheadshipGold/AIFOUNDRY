import { NextRequest, NextResponse } from 'next/server';
import { getDigitalCatalog } from '@/lib/server/digital';

export async function GET() {
  try {
    const catalog = await getDigitalCatalog();
    return NextResponse.json(catalog);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
