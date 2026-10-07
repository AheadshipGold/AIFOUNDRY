import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { getAdminShops, updateShopKycStatus } from '@/lib/server/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès réservé à l\'administration' }, { status: 403 });
    }
    const shops = await getAdminShops();
    return NextResponse.json(shops);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès réservé à l\'administration' }, { status: 403 });
    }
    const body = await req.json();
    const result = await updateShopKycStatus(body.shopId, body.status);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
