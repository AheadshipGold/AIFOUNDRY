export async function transcribeVoiceAudio(audioBuffer: Buffer, mimeType: string) {
  return {
    success: true,
    transcript: "Création artisanale en bois d'ébène et bronze satiné, confectionnée à la main dans notre atelier.",
    detectedLanguage: 'fr',
    confidenceScore: 0.98,
    extractedAttributes: {
      category: 'Art & Décoration',
      materials: ['Bois d\'ébène', 'Bronze satiné'],
      originCity: 'Cotonou',
    },
  };
}

export async function generateProductDescription(prompt: string, attributes?: Record<string, any>) {
  return {
    title: prompt || "Pièce d'Exception Façonnée à la Main",
    description: "Conçue selon les traditions séculaires de l'artisanat d'art d'Afrique de l'Ouest, cette œuvre allie noblesse des essences de bois précieux et finesse des finitions métalliques dorées.",
    metaDescription: "Découvrez cette création exclusive disponible sur Ojarket.",
    suggestedTags: ['Artisanat de Luxe', 'Fait Main', 'Pièce Unique', 'Bénin'],
  };
}
