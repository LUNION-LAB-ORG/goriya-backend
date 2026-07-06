import { JobExperienceType } from '../../../@types/enums';

// Villes où Goriya est réellement actif (Côte d'Ivoire)
export const IVORIAN_CITIES = [
    'Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo',
    'Daloa', 'Man', 'Gagnoa', 'Divo', 'Abengourou',
    'Grand-Bassam', 'Bingerville',
];

// Secteurs alignés sur les catégories affichées côté frontend (explorer-emplois)
export const COMPANY_SECTORS = [
    'Informatique', 'Marketing', 'Finance', 'Banque', 'Assurance',
    'Communication', 'Ressources humaines', 'Santé', 'Industrie',
    'Logistique', 'Juridique', 'Comptabilité', 'Distribution',
    'Conseil', 'Publicité', 'Graphisme', 'Éducation', 'Audit',
];

// Noms d'entreprises fictifs mais crédibles pour le marché ivoirien
export const COMPANY_NAMES = [
    'Ivoire Digital Solutions', 'Baoulé Tech', 'Atlantique Finance CI',
    'Lagune Telecom', 'Baobab Énergie', 'Cocoa Trade International',
    'Abidjan FinTech', 'Savane Agro-Industries', 'Ébène Consulting',
    'Lagune Digital Factory', 'Gbich Media Group', 'Yakro BTP',
    'Vridi Port Services', 'Cacao d\'Or Export', 'San-Pédro Maritime',
    'Zaguié Pharma', 'TechnoPole CI', 'Akwaba Hôtellerie',
    'Fraternité Assurances', 'Plateau Business Center', 'Koras Retail',
    'Ivoire Cargo Logistique', 'Sika Finance', 'Nouvelle Ère RH',
];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

// Bassins lexicaux pour générer un grand nombre de noms d'entreprises uniques
// (COMPANY_NAMES ne suffit pas au-delà d'une vingtaine d'entreprises)
const COMPANY_NAME_PREFIXES = [
    'Ivoire', 'Baoulé', 'Lagune', 'Savane', 'Plateau', 'Akwaba', 'Cacao', 'Baobab',
    'Atlantique', 'Zaguié', 'Sika', 'Koras', 'Vridi', 'Yakro', 'Fraternité', 'Ébène',
    'Gbich', 'TechnoPole', 'Nouvelle Ère', 'San-Pédro', 'Abidjan', 'Bouaké',
    'Grand-Bassam', 'Comoé', 'Bandama', 'Sassandra', 'Kong', 'Fresco', 'Marahoué',
    'Éburnie', 'Wôrô', 'Diaman', 'Awalé', 'Zenith CI', 'Horizon',
];

const COMPANY_NAME_SUFFIXES = [
    'Digital Solutions', 'Tech', 'Finance CI', 'Telecom', 'Énergie', 'Trade International',
    'FinTech', 'Agro-Industries', 'Consulting', 'Digital Factory', 'Media Group', 'BTP',
    'Port Services', 'Export', 'Maritime', 'Pharma', 'Hôtellerie', 'Assurances',
    'Business Center', 'Retail', 'Cargo Logistique', 'Ressources Humaines', 'Industries',
    'Group', 'SARL', '& Associés', 'Services', 'International', 'Holding', 'Systems',
    'Innovations', 'Partners', 'Capital', 'Networks',
];

function slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Génère `count` noms d'entreprises uniques (par slug) en combinant préfixes et suffixes,
// avec repli sur un compteur numérique si l'espace combinatoire venait à s'épuiser.
export function generateCompanyNames(count: number): string[] {
    const names: string[] = [];
    const usedSlugs = new Set<string>();
    let safety = 0;

    while (names.length < count && safety < count * 50) {
        safety++;
        const candidate = `${randomItem(COMPANY_NAME_PREFIXES)} ${randomItem(COMPANY_NAME_SUFFIXES)}`;
        const slug = slugify(candidate);
        if (usedSlugs.has(slug)) continue;
        usedSlugs.add(slug);
        names.push(candidate);
    }

    let n = 1;
    while (names.length < count) {
        const candidate = `${randomItem(COMPANY_NAME_PREFIXES)} ${randomItem(COMPANY_NAME_SUFFIXES)} ${n}`;
        const slug = slugify(candidate);
        if (!usedSlugs.has(slug)) {
            usedSlugs.add(slug);
            names.push(candidate);
        }
        n++;
    }

    return names;
}

// Prénoms et noms courants en Côte d'Ivoire, pour des profils candidats crédibles
export const FIRST_NAMES = [
    'Yao', 'Kouadio', 'Adjoua', 'Akissi', 'Aya', 'Konan', 'Affoué',
    'Amenan', 'Kouassi', 'Fatou', 'Awa', 'Ibrahim', 'Mamadou', 'Aminata',
    'Sekou', 'Moussa', 'Aïcha', 'Bakary', 'Aristide', 'Serge', 'Christelle',
    'Nadège', 'Grace', 'Franck', 'Larissa', 'Cynthia', 'Judith', 'Pascal',
    'Hervé', 'Sandrine', 'Junior', 'Marie-Claire',
];

export const LAST_NAMES = [
    'Kouassi', 'Koffi', 'Kouame', 'Yao', 'Konan', 'Aka', 'N\'Dri',
    'Ouattara', 'Bamba', 'Coulibaly', 'Diabaté', 'Traoré', 'Koné',
    'Diallo', 'Kra', 'Brou', 'Tanoh', 'Gnamien', 'Assi', 'Adou',
];

export interface JobTemplate {
    title: string;
    skills: string[];
}

// Intitulés de poste + compétences réalistes, couvrant les catégories populaires du site
export const JOB_TEMPLATES: JobTemplate[] = [
    { title: 'Développeur Full Stack Senior', skills: ['NestJS', 'React', 'TypeScript', 'PostgreSQL'] },
    { title: 'Développeur Backend Node.js', skills: ['NodeJS', 'NestJS', 'PostgreSQL', 'Docker'] },
    { title: 'Développeur Mobile Flutter', skills: ['Flutter', 'Dart', 'Firebase', 'REST API'] },
    { title: 'Ingénieur DevOps', skills: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'] },
    { title: 'Data Analyst', skills: ['SQL', 'Power BI', 'Python', 'Excel avancé'] },
    { title: 'Développeur Frontend React', skills: ['React', 'TypeScript', 'TailwindCSS'] },
    { title: 'Administrateur Systèmes & Réseaux', skills: ['Linux', 'Windows Server', 'Réseaux', 'Sécurité'] },
    { title: 'Responsable Marketing Digital', skills: ['SEO', 'Google Ads', 'Réseaux sociaux', 'Analytics'] },
    { title: 'Chargé de Communication', skills: ['Rédaction', 'Réseaux sociaux', 'Relations presse'] },
    { title: 'Community Manager', skills: ['Réseaux sociaux', 'Canva', 'Création de contenu'] },
    { title: 'Commercial B2B', skills: ['Prospection', 'Négociation', 'CRM'] },
    { title: 'Business Developer', skills: ['Prospection', 'Négociation', 'Stratégie commerciale'] },
    { title: 'Comptable Général', skills: ['Sage', 'Excel avancé', 'Fiscalité'] },
    { title: 'Contrôleur de Gestion', skills: ['Excel avancé', 'Analyse financière', 'Reporting'] },
    { title: 'Analyste Financier', skills: ['Analyse financière', 'Excel avancé', 'Modélisation'] },
    { title: 'Responsable Administratif et Financier', skills: ['Comptabilité', 'Gestion budgétaire', 'Excel avancé'] },
    { title: 'Chargé de Recrutement', skills: ['Sourcing', 'Entretiens', 'SIRH'] },
    { title: 'Responsable Ressources Humaines', skills: ['Droit du travail', 'Gestion des talents', 'Paie'] },
    { title: 'Juriste d\'Entreprise', skills: ['Droit des affaires', 'Rédaction juridique', 'Contrats'] },
    { title: 'Graphiste Maquettiste', skills: ['Photoshop', 'Illustrator', 'InDesign'] },
    { title: 'UI/UX Designer', skills: ['Figma', 'Prototypage', 'Design system'] },
    { title: 'Responsable Logistique', skills: ['Gestion de stock', 'Transport', 'ERP'] },
    { title: 'Agent de Transit', skills: ['Douane', 'Transport international', 'Logistique'] },
    { title: 'Infirmier(ère) d\'Entreprise', skills: ['Soins d\'urgence', 'Prévention santé'] },
    { title: 'Formateur Professionnel', skills: ['Pédagogie', 'Animation de formation'] },
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.fr', 'outlook.com'];

function stripAccents(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function randomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function randomFullName(): string {
    return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}

export function emailFromName(fullName: string, uniqueSuffix: number): string {
    const [first, last] = fullName.split(' ');
    const domain = randomItem(EMAIL_DOMAINS);
    return `${stripAccents(first)}.${stripAccents(last)}${uniqueSuffix}@${domain}`;
}

export function randomIvorianPhone(): string {
    const prefix = randomItem(['01', '05', '07', '25']);
    const rest = Array.from({ length: 4 }, () => String(Math.floor(Math.random() * 100)).padStart(2, '0')).join(' ');
    return `+225 ${prefix} ${rest}`;
}

const SALARY_RANGES: Record<JobExperienceType, [number, number]> = {
    [JobExperienceType.JUNIOR]: [150000, 350000],
    [JobExperienceType.INTERMEDIAIRE]: [350000, 700000],
    [JobExperienceType.SENIOR]: [700000, 1500000],
    [JobExperienceType.EXPERT]: [1500000, 3000000],
};

export function formatSalary(experience: JobExperienceType): string {
    const [min, max] = SALARY_RANGES[experience];
    const amount = Math.round((min + Math.random() * (max - min)) / 5000) * 5000;
    return `${amount.toLocaleString('fr-FR')} FCFA/mois`;
}

export function companyLogoUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2f6de6&color=fff&bold=true&size=128`;
}

export function buildJobDescription(title: string, companyName: string, city: string, skills: string[]): string {
    const skillsList = skills.slice(0, 3).join(', ');
    return `${companyName} recherche un(e) ${title.toLowerCase()} pour rejoindre son équipe basée à ${city}. `
        + `Vous interviendrez sur des missions variées liées à ${skillsList} et contribuerez directement à la croissance de l'entreprise. `
        + `Nous recherchons un profil rigoureux, autonome et force de proposition, capable de s'intégrer rapidement dans une équipe dynamique.`;
}

const BENEFITS_POOL = [
    'Mutuelle santé', 'Tickets restaurant', 'Prime de performance', '13ème mois',
    'Transport pris en charge', 'Formation continue', 'Télétravail partiel',
    'Prime de fin d\'année', 'Congés payés', 'Environnement de travail flexible',
];

export function buildJobBenefits(): string {
    const shuffled = [...BENEFITS_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 2)).join(', ');
}
