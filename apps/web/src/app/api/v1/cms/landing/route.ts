import { NextResponse } from 'next/server';
import { getLandingConfig, updateLandingConfig } from '@/lib/server/cms';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function GET() {
  try {
    const config = await getLandingConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur CMS' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    const body = await req.json();
    const payload = body?.data ? body.data : body;
    const config = await updateLandingConfig(payload, userId);
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur de sauvegarde CMS' }, { status: 400 });
  }
}
