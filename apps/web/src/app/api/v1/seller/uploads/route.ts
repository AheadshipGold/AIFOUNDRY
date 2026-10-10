import { NextResponse } from 'next/server';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    await requireSellerContext(req);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier transmis' }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Format d’image non supporté. Utilisez JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If R2 credentials are fully configured in environment
    const r2Account = process.env.R2_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET_NAME;

    if (r2Account && r2AccessKey && r2SecretKey && r2Bucket) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
        const s3 = new S3Client({
          region: 'auto',
          endpoint: `https://${r2Account}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: r2AccessKey,
            secretAccessKey: r2SecretKey,
          },
        });

        const extension = file.type.split('/')[1] || 'jpg';
        const key = `products/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: r2Bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        const publicDomain = process.env.R2_PUBLIC_DOMAIN || `https://${r2Bucket}.r2.dev`;
        const url = `${publicDomain.replace(/\/$/, '')}/${key}`;

        return NextResponse.json({
          success: true,
          url,
          storage: 'cloudflare-r2',
        });
      } catch (r2Err) {
        console.warn('R2 upload failed, falling back to local static storage:', r2Err);
      }
    }

    // Fallback: save locally in public/uploads for development
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      storage: 'local',
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors du téléversement de l’image' },
      { status: 500 }
    );
  }
}
