/*
  Arguments de vente affichés sur la homepage.
*/
export interface Feature {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: '⚡',
    title: 'Ultra Rapide',
    description: 'Téléchargement optimisé avec mise en cache intelligente.'
  },
  {
    icon: '🔒',
    title: 'Sécurisé',
    description: 'Aucune donnée stockée. Vos liens restent privés.'
  },
  {
    icon: '📱',
    title: 'Multi-plateforme',
    description: 'Instagram, TikTok, YouTube, Twitter et bientôt plus.'
  },
  {
    icon: '🎨',
    title: 'Sans watermark',
    description: 'Téléchargez les vidéos TikTok sans filigrane.'
  },
  {
    icon: '🎵',
    title: 'Extraction audio',
    description: 'Convertissez les vidéos en MP3 de haute qualité.'
  },
  {
    icon: '💯',
    title: '100% Gratuit',
    description: 'Aucune inscription, aucun abonnement. Vraiment gratuit.'
  }
]
