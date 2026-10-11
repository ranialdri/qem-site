/**
 * FICHIER DE CONFIGURATION OFFICIEL – QEM (Qassi Entretien Ménager)
 * Vous pouvez modifier facilement ici les villes desservies, les services,
 * la FAQ ou ajouter de vrais avis Google au fur et à mesure.
 */

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  highlights: string[];
  iconName: 'home' | 'building' | 'sparkles' | 'calendar' | 'hammer';
  image?: string;
  imageAlt?: string;
}

export interface AdvantageItem {
  id: string;
  title: string;
  description: string;
  iconName: 'shield' | 'award' | 'droplets' | 'users';
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
}

export interface ProcessStepItem {
  step: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ClientReview {
  id: string;
  author: string;
  city: string;
  service: string;
  rating: number;
  date: string;
  comment: string;
}

export const COMPANY_INFO = {
  name: 'QEM – Qassi Entretien Ménager',
  shortName: 'QEM',
  subtitle: 'Qassi Entretien Ménager',
  activity: 'Nettoyage résidentiel et commercial',
  phoneDisplay: '438-994-1630',
  phoneTel: 'tel:4389941630',
  whatsappNumber: '14389941630',
  whatsappPreFilledMessage:
    'Bonjour QEM – Qassi Entretien Ménager, j’aimerais obtenir une soumission pour un service de nettoyage.',
  email: 'qassi.menagepro@gmail.com',
  zonesSummary: 'Brossard • Longueuil • Rive-Sud',
  slogan: '« Des espaces propres, sains et agréables. »',
  heroDescription:
    'Un service de nettoyage professionnel, fiable et adapté à vos besoins résidentiels et commerciaux.',
  images: {
    hero: '/src/assets/images/hero_luxury_clean_interior_1790905078288.jpg',
    heroAlt:
      'Intérieur résidentiel moderne et impeccable nettoyé par QEM – Qassi Entretien Ménager à Brossard et sur la Rive-Sud',
    commercial: '/src/assets/images/service_commercial_office_1790905089861.jpg',
    commercialAlt:
      'Bureaux commerciaux et salle de conférence nettoyés professionnellement par QEM sur la Rive-Sud',
    deepClean: '/src/assets/images/service_deep_clean_kitchen_1790905102034.jpg',
    deepCleanAlt:
      'Cuisine moderne étincelante après un grand ménage en profondeur par QEM – Qassi Entretien Ménager',
  },
};

export function getWhatsAppUrl(customText?: string): string {
  const message = customText || COMPANY_INFO.whatsappPreFilledMessage;
  return `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * ZONES DESSERVIES (Modifiable facilement)
 * Ajoutez ou retirez des villes dans ce tableau pour mettre à jour le site et le formulaire.
 */
export const SERVED_ZONES: { name: string; description: string }[] = [
  {
    name: 'Brossard',
    description: 'Maisons, condos, appartements, bureaux et commerces dans tous les secteurs de Brossard.',
  },
  {
    name: 'Longueuil',
    description: 'Service complet d’entretien ménager résidentiel et commercial à travers Longueuil.',
  },
  {
    name: 'Saint-Hubert',
    description: 'Nettoyage régulier, grand ménage et entretien professionnel à Saint-Hubert.',
  },
  {
    name: 'Rive-Sud',
    description: 'Déplacements sur la Rive-Sud pour vos besoins résidentiels, commerciaux et après rénovation.',
  },
];

/**
 * 4 AVANTAGES PRINCIPAUX
 */
export const ADVANTAGES: AdvantageItem[] = [
  {
    id: 'fiable',
    title: 'Service fiable',
    description: 'Engagement respecté, présence ponctuelle et suivi rigoureux à chaque intervention.',
    iconName: 'shield',
  },
  {
    id: 'soigne',
    title: 'Travail soigné',
    description: 'Une attention portée aux finitions, aux surfaces délicates et aux moindres recoins.',
    iconName: 'award',
  },
  {
    id: 'produits',
    title: 'Produits de qualité',
    description: 'Utilisation de produits efficaces et sécuritaires pour un environnement sain et agréable.',
    iconName: 'droplets',
  },
  {
    id: 'equipe',
    title: 'Équipe professionnelle',
    description: 'Personnel courtois, discret et méthodique pour votre résidence ou votre entreprise.',
    iconName: 'users',
  },
];

/**
 * 5 CARTES DE SERVICES OFFICIELS
 */
export const SERVICES: ServiceItem[] = [
  {
    id: 'Nettoyage résidentiel',
    number: '01',
    title: 'Nettoyage résidentiel',
    description:
      'Nettoyage de maisons, condos et appartements pour garder votre espace propre, confortable et agréable.',
    highlights: [
      'Cuisine, comptoirs, électroménagers (extérieur) et éviers',
      'Salles de bain désinfectées et robinetterie polie',
      'Dépoussiérage complet, aspirateur et lavage des planchers',
    ],
    iconName: 'home',
    image: COMPANY_INFO.images.hero,
    imageAlt: 'Service de nettoyage résidentiel à Brossard et Longueuil par QEM',
  },
  {
    id: 'Nettoyage commercial',
    number: '02',
    title: 'Nettoyage commercial',
    description:
      'Entretien des bureaux, commerces et espaces professionnels selon vos besoins.',
    highlights: [
      'Postes de travail, salles de réunion et aires d’accueil',
      'Entretien des sanitaires, cuisinettes et espaces communs',
      'Horaires flexibles adaptés aux heures d’ouverture de votre entreprise',
    ],
    iconName: 'building',
    image: COMPANY_INFO.images.commercial,
    imageAlt: 'Service de nettoyage commercial pour bureaux et commerces à Brossard',
  },
  {
    id: 'Grand ménage',
    number: '03',
    title: 'Grand ménage',
    description:
      'Nettoyage en profondeur pour les espaces qui ont besoin d’une attention particulière.',
    highlights: [
      'Décrassage minutieux des zones difficiles d’accès, plinthes et cadrages',
      'Nettoyage approfondi de la cuisine et des salles de bain',
      'Idéal au changement de saison, avant ou après un déménagement',
    ],
    iconName: 'sparkles',
    image: COMPANY_INFO.images.deepClean,
    imageAlt: 'Grand ménage en profondeur de cuisine et résidence sur la Rive-Sud',
  },
  {
    id: 'Entretien régulier',
    number: '04',
    title: 'Entretien régulier',
    description:
      'Service hebdomadaire, bihebdomadaire ou mensuel selon votre horaire et vos besoins.',
    highlights: [
      'Fréquence sur mesure : chaque semaine, aux deux semaines ou mensuel',
      'Plan de nettoyage constant adapté à vos priorités',
      'Maintien d’un environnement toujours propre, sain et accueillant',
    ],
    iconName: 'calendar',
  },
  {
    id: 'Nettoyage après construction / rénovation',
    number: '05',
    title: 'Nettoyage après construction / rénovation',
    description:
      'Nettoyage des poussières, résidus et saletés après des travaux ou une rénovation.',
    highlights: [
      'Élimination complète de la poussière fine sur toutes les surfaces',
      'Nettoyage des vitres, cadres, armoires et appareils sanitaires neufs',
      'Remise à neuf des lieux avant l’emménagement ou la livraison',
    ],
    iconName: 'hammer',
  },
];

/**
 * POURQUOI CHOISIR QEM ?
 */
export const WHY_CHOOSE_QEM: {
  intro: string;
  items: WhyChooseItem[];
} = {
  intro:
    'Chez QEM – Qassi Entretien Ménager, nous accordons une grande importance à la qualité du travail, aux détails et à la satisfaction de nos clients.',
  items: [
    {
      id: 'personnalise',
      title: 'Service personnalisé',
      description: 'Chaque espace est unique : nous adaptons notre liste de tâches exactement à vos priorités.',
    },
    {
      id: 'minutieux',
      title: 'Travail minutieux',
      description: 'Nous portons une attention soutenue aux détails qui font la différence dans la propreté réelle.',
    },
    {
      id: 'ponctualite',
      title: 'Ponctualité',
      description: 'Respect strict des plages horaires convenues pour votre tranquillité d’esprit.',
    },
    {
      id: 'communication',
      title: 'Communication professionnelle',
      description: 'Échanges clairs, rapides et courtois par téléphone, courriel ou WhatsApp.',
    },
    {
      id: 'solutions',
      title: 'Solutions adaptées aux besoins du client',
      description: 'Intervention ponctuelle ou entretien régulier, résidentiel ou commercial selon votre rythme.',
    },
  ],
};

/**
 * PROCESSUS EN 5 ÉTAPES (COMMENT ÇA FONCTIONNE ?)
 */
export const PROCESS_STEPS: ProcessStepItem[] = [
  {
    step: '01',
    title: 'Demandez une soumission',
    description: 'Remplissez notre formulaire en ligne, appelez-nous ou écrivez-nous sur WhatsApp.',
  },
  {
    step: '02',
    title: 'Nous analysons vos besoins',
    description: 'Nous étudions le type d’espace, la superficie et les services souhaités.',
  },
  {
    step: '03',
    title: 'Nous vous contactons pour discuter des détails',
    description: 'Échange rapide pour confirmer vos attentes spécifiques et répondre à vos questions.',
  },
  {
    step: '04',
    title: 'Planification du service',
    description: 'Choix de la date, de l’heure préférée et de la fréquence qui vous conviennent.',
  },
  {
    step: '05',
    title: 'Nettoyage professionnel',
    description: 'Réalisation soignée du ménage pour vous offrir un espace propre, sain et agréable.',
  },
];

/**
 * OPTIONS DU FORMULAIRE DE SOUMISSION
 */
export const QUOTE_FORM_OPTIONS = {
  serviceTypes: [
    'Nettoyage résidentiel',
    'Nettoyage commercial',
    'Grand ménage',
    'Entretien régulier',
    'Nettoyage après construction / rénovation',
    'Autre',
  ],
  propertyTypes: [
    'Maison',
    'Appartement',
    'Condo',
    'Bureau',
    'Commerce',
    'Immeuble',
    'Autre',
  ],
  frequencies: [
    'Une seule fois',
    'Chaque semaine',
    'Aux deux semaines',
    'Chaque mois',
    'À déterminer',
  ],
  preferredTimes: ['Matin', 'Après-midi', 'Soir', 'Flexible'],
  extraServices: [
    'Cuisine',
    'Salles de bain',
    'Chambres',
    'Salon / espaces communs',
    'Vitres',
    'Nettoyage en profondeur',
    'Autre',
  ],
};

/**
 * AVIS DE NOS CLIENTS
 * Aucun faux avis n'est inventé. Ajoutez vos vrais avis Google dans ce tableau
 * au fur et à mesure pour qu'ils s'affichent automatiquement sur le site.
 */
export const CLIENT_REVIEWS: ClientReview[] = [];

/**
 * FOIRE AUX QUESTIONS (FAQ)
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Quels types de nettoyage offrez-vous ?',
    answer:
      'Nous offrons cinq services principaux : le nettoyage résidentiel, le nettoyage commercial, le grand ménage en profondeur, l’entretien ménager régulier ainsi que le nettoyage après construction ou rénovation.',
  },
  {
    question: 'Travaillez-vous avec les particuliers ?',
    answer:
      'Oui. Nous intervenons dans les maisons, les condos et les appartements pour des visites ponctuelles, des grands ménages ou un entretien régulier.',
  },
  {
    question: 'Travaillez-vous avec les entreprises ?',
    answer:
      'Oui. Nous assurons le nettoyage commercial pour les bureaux, commerces et espaces professionnels selon un horaire adapté à vos activités.',
  },
  {
    question: 'Offrez-vous des services réguliers ?',
    answer:
      'Tout à fait. Vous pouvez opter pour un entretien chaque semaine, aux deux semaines ou chaque mois selon votre horaire et vos besoins.',
  },
  {
    question: 'Comment obtenir une soumission ?',
    answer:
      'Il suffit de remplir le formulaire « Demandez votre soumission gratuite » sur cette page, de nous appeler au 438-994-1630 ou de nous écrire directement sur WhatsApp.',
  },
  {
    question: 'Dans quelles villes vous déplacez-vous ?',
    answer:
      'Nous desservons Brossard, Longueuil, Saint-Hubert ainsi que les environs sur la Rive-Sud.',
  },
  {
    question: 'Peut-on demander un grand ménage ?',
    answer:
      'Oui. Notre service de grand ménage est conçu pour nettoyer en profondeur les espaces qui nécessitent une attention particulière (cuisine, salles de bain, vitres, plinthes et recoins).',
  },
  {
    question: 'Comment vous contacter ?',
    answer:
      'Vous pouvez nous joindre par téléphone au 438-994-1630, par WhatsApp au +1 438-994-1630, par courriel à qassi.menagepro@gmail.com ou via notre formulaire de soumission en ligne.',
  },
];
