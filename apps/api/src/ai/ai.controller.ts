import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  async getStatus() {
    return this.aiService.getStatus();
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(
    @UploadedFile() file: any,
    @Body('language') language?: string
  ) {
    if (!file) {
      throw new BadRequestException("Aucun fichier audio n a été fourni dans la requête (champ file requis).");
    }

    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException("Le fichier audio dépasse la limite autorisée de 25 Mo.");
    }

    const mimeType = file.mimetype || 'audio/webm';
    const filename = file.originalname || 'voice-input.webm';

    const result = await this.aiService.transcribeAudio(
      file.buffer,
      mimeType,
      filename,
      language || 'fr'
    );

    return {
      success: true,
      text: result.text,
      provider: result.provider,
      model: result.model,
      language: result.language,
    };
  }

  @Post('generate-product')
  async generateProduct(
    @Body('prompt') prompt: string,
    @Body('category') category?: string,
    @Body('language') language?: string
  ) {
    if (!prompt) {
      throw new BadRequestException('Le champ prompt est requis.');
    }

    const result = await this.aiService.generateProductContent(
      prompt,
      category,
      language || 'fr'
    );

    return {
      success: true,
      data: result,
    };
  }
}
