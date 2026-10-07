import { prisma } from './prisma';
import * as crypto from 'crypto';

export async function listCatalogDigitalAssets() {
  const assets = await prisma.digitalAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return assets.map((a) => ({
    id: a.id,
    title: a.title,
    fileUrl: a.fileUrl,
    fileSize: a.fileSize,
    mimeType: a.mimeType,
    checksum: a.checksum,
    version: a.version,
    isPublicPreview: a.isPublicPreview,
    licenseType: 'Licence Commerciale Marchande Standard',
    format: a.mimeType.includes('pdf') ? 'PDF Haute Définition' : 'Fichier Numérique',
  }));
}

export const getDigitalCatalog = listCatalogDigitalAssets;

export async function getBuyerGrants(userId?: string) {
  if (!userId) return [];
  const entitlements = await prisma.digitalEntitlement.findMany({
    where: { userId },
    include: { asset: true, order: true },
    orderBy: { createdAt: 'desc' },
  });

  return entitlements.map((e) => ({
    id: e.id,
    orderId: e.orderId,
    orderNumber: e.order?.orderNumber || 'CMD-DIGITAL',
    assetTitle: e.asset.title,
    version: e.asset.version,
    mimeType: e.asset.mimeType,
    downloadCount: e.downloadCount,
    maxDownloads: e.maxDownloads,
    remainingDownloads: Math.max(0, e.maxDownloads - e.downloadCount),
    downloadUrl: `/api/v1/digital/download/${e.id}`,
    license: 'Licence Commerciale Marchande',
    createdAt: e.createdAt.toISOString(),
    expiresAt: e.expiresAt?.toISOString(),
  }));
}

export const getUserDigitalGrants = getBuyerGrants;

export async function verifyAndGenerateDownloadUrl(userId: string, entitlementId: string) {
  const entitlement = await prisma.digitalEntitlement.findFirst({
    where: { id: entitlementId, userId },
    include: { asset: true },
  });

  if (!entitlement) throw new Error('Droit numérique introuvable ou non autorisé');
  if (entitlement.expiresAt && new Date() > entitlement.expiresAt) throw new Error('Ce droit a expiré');
  if (entitlement.downloadCount >= entitlement.maxDownloads) throw new Error('Quota de téléchargement atteint');

  const updated = await prisma.digitalEntitlement.update({
    where: { id: entitlementId },
    data: { downloadCount: { increment: 1 } },
    include: { asset: true },
  });

  const expiresInSeconds = 900;
  const expiresTimestamp = Date.now() + expiresInSeconds * 1000;
  const signaturePayload = `${entitlementId}|${updated.asset.id}|${expiresTimestamp}`;
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'ojarket_secret').update(signaturePayload).digest('hex');

  const signedUrl = `https://ojarket.com/api/v1/digital/file?entitlementId=${entitlementId}&expires=${expiresTimestamp}&sig=${signature}`;

  return {
    title: updated.asset.title,
    mimeType: updated.asset.mimeType,
    downloadUrl: signedUrl,
    remainingDownloads: Math.max(0, updated.maxDownloads - updated.downloadCount),
    downloadCount: updated.downloadCount,
    expiresInSeconds,
    isPresigned: false,
  };
}

export const generateDownloadUrl = verifyAndGenerateDownloadUrl;
