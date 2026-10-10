import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { updateSellerProduct, deleteSellerProduct } from '@/lib/server/catalog';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
        variants: true,
        reviews: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Produit introuvable' }, { status: 404 });
    }

    const priceMinor = product.variants.length > 0 ? product.variants[0].priceMinor : 0;
    const currency = product.variants.length > 0 ? product.variants[0].currency : 'XOF';
    const stockOnHand = product.variants.reduce((acc, v) => acc + v.stockOnHand, 0);
    const reviewsCount = product.reviews.length;
    const rating =
      reviewsCount > 0
        ? Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : null;

    return NextResponse.json({
      id: product.id,
      title: product.title,
      description: product.description || '',
      category: product.category,
      artisanShop: {
        id: product.shop.id,
        name: product.shop.name,
        city: product.shop.city,
        country: product.shop.country,
        verified: product.shop.isVerified,
      },
      priceMinor,
      currency,
      stockOnHand,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      images: product.images || [],
      isPublished: product.isPublished,
      originCity: product.originCity,
      variants: product.variants,
      rating,
      reviewsCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur produit' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireSellerContext(req);
    const body = await req.json();

    const updated = await updateSellerProduct(id, context.shop.id, {
      title: body.title,
      description: body.description,
      category: body.category,
      originCity: body.originCity,
      priceMinor: body.priceMinor !== undefined ? Number(body.priceMinor) : undefined,
      stockOnHand: body.stockOnHand !== undefined ? Number(body.stockOnHand) : undefined,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
      images: Array.isArray(body.images) ? body.images : body.image ? [body.image] : undefined,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la mise à jour' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireSellerContext(req);
    await deleteSellerProduct(id, context.shop.id);
    return NextResponse.json({ success: true, message: 'Produit supprimé' });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la suppression' },
      { status: 400 }
    );
  }
}
