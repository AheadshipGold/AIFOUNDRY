import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forceExpo = url.searchParams.get('source') === 'expo';

  // Expo build fallback URL (active now)
  const expoBuildUrl = 'https://expo.dev/artifacts/eas/ZYFhBvoO0TEv8fDq_HCKXfv-Wku8kTmpp8WHU6EEnA8.apk';

  if (forceExpo) {
    return NextResponse.redirect(expoBuildUrl, 307);
  }

  // Redirect to official media proxy route on Cloudflare R2
  const r2ProxyUrl = `${url.origin}/api/v1/media/releases/ojarket-latest.apk`;

  return NextResponse.redirect(r2ProxyUrl, 307);
}

export const HEAD = GET;
