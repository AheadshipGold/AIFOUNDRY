import { NextResponse } from 'next/server';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    await requireSellerContext(req);

    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let originalName = 'upload.jpg';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      const base64Data = body.base64 || body.image || '';
      if (!base64Data) {
        return NextResponse.json({ message: 'Aucune donnée d’image transmise' }, { status: 400 });
      }
      originalName = body.filename || body.name || 'upload.jpg';
      mimeType = body.mimeType || body.type || 'image/jpeg';
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ message: 'Aucun fichier transmis' }, { status: 400 });
      }

      originalName = file.name || 'upload.jpg';
      mimeType = file.type || '';
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    // Validate and auto-normalize mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!validTypes.includes(mimeType) || mimeType === 'application/octet-stream') {
      const ext = originalName.split('.').pop()?.toLowerCase();
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'avif') mimeType = 'image/avif';
      else if (ext === 'gif') mimeType = 'image/gif';
      else mimeType = 'image/jpeg';
    }

    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { message: 'Format d’image non supporté. Utilisez JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // R2 / S3 Configuration resolution with root monorepo fallback
    let r2Account = process.env.R2_ACCOUNT_ID;
    let r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    let r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    let r2Bucket = process.env.R2_BUCKET_NAME || 'ojarket-media';
    let r2Endpoint = process.env.R2_ENDPOINT;

    if (!r2AccessKey) {
      const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
        path.resolve(process.cwd(), '../.env'),
        'c:/S_S/AI_F/AIFOUNFRYAPP/.env',
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          try {
            const content = fs.readFileSync(c, 'utf8');
            for (const line of content.split('\n')) {
              const parts = line.trim().split('=');
              if (parts.length >= 2) {
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
                if (k === 'R2_ACCOUNT_ID' && !r2Account) r2Account = v;
                if (k === 'R2_ACCESS_KEY_ID' && !r2AccessKey) r2AccessKey = v;
                if (k === 'R2_SECRET_ACCESS_KEY' && !r2SecretKey) r2SecretKey = v;
                if (k === 'R2_BUCKET_NAME' && v) r2Bucket = v;
                if (k === 'R2_ENDPOINT' && !r2Endpoint) r2Endpoint = v;
              }
            }
            if (r2AccessKey) break;
          } catch {}
        }
      }
    }

    if (!r2Endpoint && r2Account) {
      r2Endpoint = `https://${r2Account}.r2.cloudflarestorage.com`;
    }

    const extension = mimeType.split('/')[1] || 'jpg';
    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const key = `products/${filename}`;

    // Always maintain local copy in public/uploads for local development
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    if (r2Endpoint && r2AccessKey && r2SecretKey && r2Bucket) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
        const s3 = new S3Client({
          region: 'auto',
          endpoint: r2Endpoint,
          credentials: {
            accessKeyId: r2AccessKey,
            secretAccessKey: r2SecretKey,
          },
        });

        await s3.send(
          new PutObjectCommand({
            Bucket: r2Bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
          })
        );

        const url = `/api/v1/media/${key}`;

        return NextResponse.json({
          success: true,
          url,
          storage: 'cloudflare-r2',
        });
      } catch (r2Err) {
        console.warn('R2 upload failed, falling back to local static storage:', r2Err);
      }
    }

    // If R2 was not used or failed, return local storage URL
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
