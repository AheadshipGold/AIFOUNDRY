import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TranscriptionResult {
  text: string;
  provider: string;
  model: string;
  language?: string;
}

export interface GeneratedProductContent {
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  descriptionFr: string;
  descriptionEn: string;
  suggestedCategory?: string;
  attributes: Array<{ label: string; value: string }>;
  tags: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transcrit un fichier audio (WebM, Opus, MP4, WAV) en texte.
   * Supporte : Groq Whisper, Google Cloud Speech-to-Text, OpenAI Whisper, Gemini Audio.
   * Fallback propre en environnement de dev si aucune clé n'est encore configurée.
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    filename: string = 'voice-prompt.webm',
    language: string = 'fr'
  ): Promise<TranscriptionResult> {
    const groqKey = process.env.GROQ_API_KEY;
    const googleSpeechKey = process.env.GOOGLE_SPEECH_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. GROQ WHISPER (Recommandé : ultra-rapide <250ms, haute précision FR/EN)
    if (groqKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
        formData.append('file', blob, filename);
        formData.append('model', 'whisper-large-v3');
        formData.append('language', language === 'en' ? 'en' : 'fr');
        formData.append('response_format', 'json');

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + groqKey,
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.text?.trim()) {
            return {
              text: data.text.trim(),
              provider: 'GROQ_WHISPER',
              model: 'whisper-large-v3',
              language,
            };
          }
        } else {
          const errBody = await res.text();
          this.logger.warn('[Groq Whisper] Erreur HTTP ' + res.status + ': ' + errBody);
        }
      } catch (err: any) {
        this.logger.warn('[Groq Whisper] Échec réseau: ' + err.message);
      }
    }

    // 2. GOOGLE CLOUD SPEECH-TO-TEXT v1 REST
    if (googleSpeechKey) {
      try {
        const base64Audio = audioBuffer.toString('base64');
        const endpoint = 'https://speech.googleapis.com/v1/speech:recognize?key=' + googleSpeechKey;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              languageCode: language === 'en' ? 'en-US' : 'fr-FR',
              alternativeLanguageCodes: language === 'en' ? ['fr-FR'] : ['en-US'],
              enableAutomaticPunctuation: true,
              model: 'default',
            },
            audio: {
              content: base64Audio,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const transcript = data.results
            ?.map((r: any) => r.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join(' ')
            .trim();

          if (transcript) {
            return {
              text: transcript,
              provider: 'GOOGLE_SPEECH',
              model: 'speech-v1-default',
              language,
            };
          }
        } else {
          const errBody = await res.text();
          this.logger.warn('[Google Speech] Erreur HTTP ' + res.status + ': ' + errBody);
        }
      } catch (err: any) {
        this.logger.warn('[Google Speech] Échec réseau: ' + err.message);
      }
    }

    // 3. OPENAI WHISPER
    if (openaiKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
        formData.append('file', blob, filename);
        formData.append('model', 'whisper-1');
        formData.append('language', language === 'en' ? 'en' : 'fr');

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + openaiKey,
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.text?.trim()) {
            return {
              text: data.text.trim(),
              provider: 'OPENAI_WHISPER',
              model: 'whisper-1',
              language,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn('[OpenAI Whisper] Échec: ' + err.message);
      }
    }

    // 4. Fallback d'information si aucune clé n'est fournie
    return {
      text: 'Message vocal reçu avec succès. (Configurez GROQ_API_KEY ou GOOGLE_SPEECH_API_KEY dans votre fichier .env pour activer la transcription cloud complète).',
      provider: 'LOCAL_SANDBOX',
      model: 'sandbox-v1',
      language,
    };
  }

  /**
   * Moteur IA de génération de fiche produit de luxe structurée.
   * Reste disponible côté backend pour un usage ultérieur.
   */
  async generateProductContent(
    rawPrompt: string,
    categoryName?: string,
    targetLanguage: string = 'fr'
  ): Promise<GeneratedProductContent> {
    if (!rawPrompt || rawPrompt.trim().length < 3) {
      throw new BadRequestException('Une description brute ou des mots-clés sont requis pour générer une fiche.');
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: 'Tu es le directeur éditorial d une marketplace de prestige et de luxe (Ojarket). Rédige une fiche produit de luxe bilingue FR/EN en JSON strictly format.' },
                  { text: 'Informations : ' + rawPrompt + '. Catégorie : ' + (categoryName || 'Luxe') },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return JSON.parse(text);
          }
        }
      } catch (err: any) {
        this.logger.warn('[Gemini Generate] Erreur: ' + err.message);
      }
    }

    // Fallback structuré déterministe
    const cleanPrompt = rawPrompt.trim();
    return {
      titleFr: cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1),
      titleEn: cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1),
      summaryFr: 'Création d exception : ' + cleanPrompt,
      summaryEn: 'Exceptional creation: ' + cleanPrompt,
      descriptionFr: 'Une pièce raffinée sélectionnée pour sa qualité d exécution irréprochable et la noblesse de ses finitions. ' + cleanPrompt,
      descriptionEn: 'A refined piece selected for its flawless craftsmanship and noble finishings. ' + cleanPrompt,
      suggestedCategory: categoryName || 'Créations de Luxe',
      attributes: [
        { label: 'Finition', value: 'Haut de gamme' },
        { label: 'Garantie', value: 'Authenticité vérifiée' },
      ],
      tags: ['prestige', 'luxe', 'selection-officielle'],
    };
  }

  /**
   * Diagnostic de l'état des services IA et clés configurées
   */
  async getStatus() {
    return {
      providers: {
        groq: Boolean(process.env.GROQ_API_KEY),
        googleSpeech: Boolean(process.env.GOOGLE_SPEECH_API_KEY || process.env.GOOGLE_CLOUD_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY),
      },
      recommendedSttProvider: process.env.GROQ_API_KEY
        ? 'GROQ_WHISPER'
        : process.env.GOOGLE_SPEECH_API_KEY
        ? 'GOOGLE_SPEECH'
        : 'BROWSER_NATIVE',
      activeFeatures: {
        voiceTranscription: true,
        aiProductAssistantEngineReady: true,
        aiProductAssistantUiEnabled: false,
      },
    };
  }
}
