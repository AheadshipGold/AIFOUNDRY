import { NextResponse } from 'next/server';
import { getSubscriptionGateways } from '@/lib/server/subscription-gateways';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gateways = await getSubscriptionGateways();
    return NextResponse.json({ success: true, gateways });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
