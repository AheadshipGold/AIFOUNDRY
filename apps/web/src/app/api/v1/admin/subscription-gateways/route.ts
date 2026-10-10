import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { getSubscriptionGateways, updateSubscriptionGateways } from '@/lib/server/subscription-gateways';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 });
    }
    const gateways = await getSubscriptionGateways();
    return NextResponse.json({ success: true, gateways });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 });
    }

    const body = await req.json();
    let updates: Record<string, boolean> = {};

    if (body.gatewayId !== undefined && typeof body.isEnabled === 'boolean') {
      updates[body.gatewayId] = body.isEnabled;
    } else if (body.updates && typeof body.updates === 'object') {
      updates = body.updates;
    } else if (body.gateways && typeof body.gateways === 'object') {
      for (const [k, v] of Object.entries(body.gateways)) {
        if (typeof v === 'boolean') {
          updates[k] = v;
        } else if (v && typeof (v as any).isEnabled === 'boolean') {
          updates[k] = (v as any).isEnabled;
        }
      }
    }

    const updated = await updateSubscriptionGateways(updates);

    // Audit log
    await prisma.adminAuditLog
      .create({
        data: {
          adminId: user.id,
          action: 'UPDATE_SUBSCRIPTION_GATEWAYS',
          targetResource: 'subscription_gateways',
          targetId: 'subscription_gateways',
          beforeState: {},
          afterState: updates,
        },
      })
      .catch(() => null);

    return NextResponse.json({ success: true, gateways: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
