import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { DigitalService, DigitalAssetItem, DigitalGrantItem, DownloadResponse } from './digital.service';
import { Response } from 'express';

@Controller('v1/digital')
export class DigitalController {
  constructor(private readonly digitalService: DigitalService) {}

  @Get('catalog')
  async listCatalog(): Promise<DigitalAssetItem[]> {
    return this.digitalService.listCatalogDigitalAssets();
  }

  @Get('entitlements')
  async getEntitlements(): Promise<DigitalGrantItem[]> {
    return this.digitalService.getBuyerGrants();
  }

  @Post('download/:id')
  async download(@Param('id') id: string): Promise<DownloadResponse> {
    return this.digitalService.verifyAndGenerateSignedDownloadUrl(id);
  }

  @Get('file/:id')
  async streamFile(
    @Param('id') id: string,
    @Query('token') token: string,
    @Query('expires') expires: string,
    @Res() res: Response
  ) {
    const fileInfo = await this.digitalService.resolveSecureFileDownload(
      id,
      token,
      Number(expires)
    );

    // Redirige vers l'URL sécurisée du fichier ou renvoie les headers adaptés
    if (fileInfo.fileUrl.startsWith('http://') || fileInfo.fileUrl.startsWith('https://')) {
      return res.redirect(fileInfo.fileUrl);
    }

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.title)}"`);
    return res.json({
      status: 'SUCCESS',
      message: 'Autorisation de téléchargement validée avec succès',
      fileUrl: fileInfo.fileUrl,
      title: fileInfo.title,
    });
  }
}
