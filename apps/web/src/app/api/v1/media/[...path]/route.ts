import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

function getEnvConfig() {
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

  return { r2Account, r2AccessKey, r2SecretKey, r2Bucket, r2Endpoint };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const pathSegments = resolvedParams?.path || [];
    const key = pathSegments.join('/');

    if (!key) {
      return new NextResponse('Chemin média introuvable', { status: 400 });
    }

    // Determine MIME type by file extension
    const ext = key.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      avif: 'image/avif',
      mp4: 'video/mp4',
      apk: 'application/vnd.android.package-archive',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    // 1. Try Cloudflare R2 if configured
    const { r2AccessKey, r2SecretKey, r2Bucket, r2Endpoint } = getEnvConfig();

    if (r2Endpoint && r2AccessKey && r2SecretKey && r2Bucket) {
      try {
        const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
        const s3 = new S3Client({
          region: 'auto',
          endpoint: r2Endpoint,
          credentials: {
            accessKeyId: r2AccessKey,
            secretAccessKey: r2SecretKey,
          },
        });

        const r2Res = await s3.send(
          new GetObjectCommand({
            Bucket: r2Bucket,
            Key: key,
          })
        );

        if (r2Res.Body) {
          const stream = r2Res.Body.transformToWebStream();
          return new NextResponse(stream, {
            status: 200,
            headers: {
              'Content-Type': r2Res.ContentType || contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch (r2Err: any) {
        // If not in R2, fall through to check local storage
        console.warn(`R2 fetch failed for key "${key}":`, r2Err?.message);
      }
    }

    // 2. Fallback: check local storage in public/uploads or public
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filename = pathSegments[pathSegments.length - 1];
    const localUploadFilePath = path.join(localUploadsDir, filename);

    if (fs.existsSync(localUploadFilePath)) {
      const fileBuffer = fs.readFileSync(localUploadFilePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const publicFilePath = path.join(process.cwd(), 'public', ...pathSegments);
    if (fs.existsSync(publicFilePath)) {
      const fileBuffer = fs.readFileSync(publicFilePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new NextResponse('Média introuvable', { status: 404 });
  } catch (err: any) {
    console.error('Media proxy error:', err);
    return new NextResponse('Erreur serveur média', { status: 500 });
  }
}

export const HEAD = GET;

