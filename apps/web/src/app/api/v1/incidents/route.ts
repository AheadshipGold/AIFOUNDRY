import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { createIncident, listIncidents } from '@/lib/server/incidents';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const incidents = await listIncidents(user.id, user.role);
    return NextResponse.json(incidents);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const body = await req.json();
    const incident = await createIncident(user.id, body);
    return NextResponse.json(incident, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
