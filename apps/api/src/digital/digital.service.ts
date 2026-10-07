import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface DigitalAssetItem {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  version: string;
  isPublicPreview: boolean;
  licenseType: string;
  format: string;
}

export interface DigitalGrantItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  assetTitle: string;
  version: string;
  mimeType: string;
  downloadCount: number;
  maxDownloads: number;
  remainingDownloads: number;
  downloadUrl: string;
  license: string;
  createdAt: string;
  expiresAt?: string;
}

export interface DownloadResponse {
  title: string;
  mimeType: string;
  downloadUrl: string;
  remainingDownloads: number;
  downloadCount: number;
  expiresInSeconds: number;
  isPresigned: boolean;
}

@Injectable()
export class DigitalService {
  private readonly secretKey: string;
  private readonly r2Bucket?: string;
  private readonly r2Endpoint?: string;
  private readonly r2AccessKeyId?: string;
  private readonly r2SecretAccessKey?: string;

  constructor(private readonly prisma: PrismaService) {
    this.secretKey = process.env.JWT_SECRET || 'ojarket_secure_digital_secret_2026';
    this.r2Bucket = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    this.r2Endpoint = process.env.R2_ENDPOINT || process.env.S3_ENDPOINT;
    this.r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    this.r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  }

  async listCatalogDigitalAssets(): Promise<DigitalAssetItem[]> {
    const assets = await this.prisma.digitalAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((a) => ({
      id: a.id,
      title: a.title,
      fileUrl: a.fileUrl,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
      checksum: a.checksum,
      version: a.version,
      isPublicPreview: a.isPublicPreview,
      licenseType: 'Licence Commerciale Marchande Standard · Usage Personnel & Professionnel',
      format: a.mimeType.includes('pdf') ? 'PDF Haute Définition' : 'Fichier Numérique',
    }));
  }

  async getBuyerGrants(userId?: string): Promise<DigitalGrantItem[]> {
    if (!userId) {
      return [];
    }

    const entitlements = await this.prisma.digitalEntitlement.findMany({
      where: { userId },
      include: {
        asset: true,
        order: true,
      },
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
      downloadUrl: `/v1/digital/download/${e.id}`,
      license: 'Licence Commerciale Marchande · Droit d’exploitation',
      createdAt: e.createdAt.toISOString(),
      expiresAt: e.expiresAt?.toISOString(),
    }));
  }

  /**
   * Génère une URL de téléchargement signée et temporaire (valable 15 minutes)
   * avec vérification stricte du quota de téléchargement restant et mise à jour atomique.
   */
  async verifyAndGenerateSignedDownloadUrl(entitlementId: string): Promise<DownloadResponse> {
    const entitlement = await this.prisma.digitalEntitlement.findUnique({
      where: { id: entitlementId },
      include: { asset: true },
    });

    if (!entitlement) {
      throw new NotFoundException(`Droit numérique introuvable.`);
    }

    if (entitlement.expiresAt && new Date() > entitlement.expiresAt) {
      throw new BadRequestException(`Ce droit de téléchargement a expiré.`);
    }

    if (entitlement.downloadCount >= entitlement.maxDownloads) {
      throw new BadRequestException(
        `Quota de téléchargement atteint (${entitlement.maxDownloads}/${entitlement.maxDownloads}). Contactez la conciergerie Ojarket pour réinitialiser le jeton.`
      );
    }

    // Incrémente le compteur de téléchargement
    const updated = await this.prisma.digitalEntitlement.update({
      where: { id: entitlementId },
      data: { downloadCount: { increment: 1 } },
      include: { asset: true },
    });

    const expiresInSeconds = 900; // 15 minutes
    const expiresTimestamp = Date.now() + expiresInSeconds * 1000;

    // 1. Si AWS S3 / Cloudflare R2 est configuré, générer une URL pré-signée S3
    if (this.r2Bucket && this.r2AccessKeyId && this.r2SecretAccessKey) {
      try {
        const presignedUrl = await this.generateS3PresignedUrl(
          updated.asset.fileUrl,
          expiresInSeconds
        );
        return {
          title: updated.asset.title,
          mimeType: updated.asset.mimeType,
          downloadUrl: presignedUrl,
          remainingDownloads: updated.maxDownloads - updated.downloadCount,
          downloadCount: updated.downloadCount,
          expiresInSeconds,
          isPresigned: true,
        };
      } catch (error) {
        console.warn('[DigitalService] Fallback sur signature HMAC interne :', error);
      }
    }

    // 2. Fallback cryptographique HMAC-SHA256 avec jeton temporaire sécurisé
    const token = this.generateDownloadToken(entitlementId, updated.asset.id, expiresTimestamp);
    const downloadUrl = `/v1/digital/file/${entitlementId}?token=${token}&expires=${expiresTimestamp}`;

    return {
      title: updated.asset.title,
      mimeType: updated.asset.mimeType,
      downloadUrl,
      remainingDownloads: updated.maxDownloads - updated.downloadCount,
      downloadCount: updated.downloadCount,
      expiresInSeconds,
      isPresigned: false,
    };
  }

  /**
   * Vérifie le jeton de téléchargement cryptographique et résout le fichier cible.
   */
  async resolveSecureFileDownload(
    entitlementId: string,
    token: string,
    expires: number
  ): Promise<{ fileUrl: string; title: string; mimeType: string }> {
    if (Date.now() > Number(expires)) {
      throw new UnauthorizedException(`Le lien de téléchargement a expiré. Veuillez générer un nouveau lien.`);
    }

    const entitlement = await this.prisma.digitalEntitlement.findUnique({
      where: { id: entitlementId },
      include: { asset: true },
    });

    if (!entitlement) {
      throw new NotFoundException(`Droit numérique introuvable.`);
    }

    const expectedToken = this.generateDownloadToken(
      entitlementId,
      entitlement.asset.id,
      Number(expires)
    );

    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expectedToken);

    if (
      tokenBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(tokenBuf, expectedBuf)
    ) {
      throw new UnauthorizedException(`Signature de téléchargement invalide ou altérée.`);
    }

    return {
      fileUrl: entitlement.asset.fileUrl,
      title: entitlement.asset.title,
      mimeType: entitlement.asset.mimeType,
    };
  }

  private generateDownloadToken(entitlementId: string, assetId: string, expires: number): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(`${entitlementId}:${assetId}:${expires}`)
      .digest('hex');
  }

  private async generateS3PresignedUrl(fileKey: string, expiresIn: number): Promise<string> {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const s3Client = new S3Client({
      region: process.env.R2_REGION || process.env.AWS_REGION || 'auto',
      endpoint: this.r2Endpoint,
      credentials: {
        accessKeyId: this.r2AccessKeyId,
        secretAccessKey: this.r2SecretAccessKey,
      },
    });

    const command = new GetObjectCommand({
      Bucket: this.r2Bucket,
      Key: fileKey,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }
}
