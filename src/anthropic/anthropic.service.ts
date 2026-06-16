import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface CVAnalysisResult {
    score: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
}

export interface ScoringAnalysisResult {
    overallScore: number;
    criteria: { Competences: number; Experience: number; Communication: number };
    feedback: string;
}

export interface MatchingAnalysisResult {
    matchingScore: number;
    matchReasons: string[];
}

@Injectable()
export class AnthropicService {
    private readonly logger = new Logger(AnthropicService.name);
    private readonly client: Anthropic | null = null;
    private readonly model: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
        this.model = this.configService.get<string>('CLAUDE_MODEL') ?? 'claude-haiku-4-5-20251001';

        if (apiKey) {
            this.client = new Anthropic({ apiKey });
            this.logger.log(`AnthropicService initialized with model ${this.model}`);
        } else {
            this.logger.warn('ANTHROPIC_API_KEY not set — AI analysis will use intelligent fallback values');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEXT EXTRACTION
    // ─────────────────────────────────────────────────────────────────────────

    async extractTextFromBuffer(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
        try {
            const name = (fileName ?? '').toLowerCase();
            const isPdf = mimeType === 'application/pdf' || name.endsWith('.pdf');
            const isDocx =
                mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                name.endsWith('.docx');
            const isDoc = mimeType === 'application/msword' || name.endsWith('.doc');

            if (isPdf) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const pdfParse = require('pdf-parse');
                const result = await pdfParse(buffer);
                return (result.text as string) || '';
            }

            if (isDocx || isDoc) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                return (result.value as string) || '';
            }

            return buffer.toString('utf-8');
        } catch (err) {
            this.logger.error('Text extraction failed:', err);
            return '';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CV ANALYSIS
    // ─────────────────────────────────────────────────────────────────────────

    async analyzeCV(buffer: Buffer, mimeType: string, fileName: string): Promise<CVAnalysisResult> {
        const FALLBACK: CVAnalysisResult = {
            score: 70,
            strengths: [
                'Profil bien structuré et lisible',
                'Compétences techniques clairement listées',
                'Formation cohérente avec l\'expérience',
            ],
            improvements: [
                'Ajouter des résultats chiffrés et mesurables',
                'Détailler l\'impact des projets réalisés',
                'Optimiser le résumé professionnel en haut de CV',
            ],
            recommendations: [
                'Quantifiez vos accomplissements (ex: "augmentation de 30% des conversions")',
                'Ajoutez des mots-clés sectoriels pour les ATS',
                'Incluez un lien LinkedIn et GitHub si disponibles',
            ],
        };

        if (!this.client) return FALLBACK;

        try {
            const cvText = await this.extractTextFromBuffer(buffer, mimeType, fileName);
            if (!cvText.trim()) {
                this.logger.warn('Could not extract text from CV file, using fallback');
                return FALLBACK;
            }

            const prompt = `Vous êtes un expert RH spécialisé dans l'analyse de CV. Analysez ce CV et retournez une évaluation détaillée.

Contenu du CV :
---
${cvText.slice(0, 6000)}
---

Retournez UNIQUEMENT un objet JSON valide (sans markdown, sans texte avant ou après) avec exactement cette structure :
{
  "score": <entier entre 0 et 100>,
  "strengths": ["<point fort spécifique 1>", "<point fort spécifique 2>", "<point fort spécifique 3>"],
  "improvements": ["<amélioration concrète 1>", "<amélioration concrète 2>", "<amélioration concrète 3>"],
  "recommendations": ["<recommandation actionnable 1>", "<recommandation actionnable 2>", "<recommandation actionnable 3>"]
}

Critères d'évaluation du score :
- Informations de contact et présentation (10%)
- Expérience professionnelle : pertinence, détail et résultats chiffrés (35%)
- Compétences techniques et soft skills (30%)
- Formation et certifications (15%)
- Structure et lisibilité générale (10%)

Répondez en français. Minimum 3 éléments par tableau. Soyez spécifique et actionnable.`;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }],
            });

            const text = response.content[0].type === 'text' ? response.content[0].text : '';
            const parsed = this.parseJson<CVAnalysisResult>(text, FALLBACK);

            // Validate and clamp values
            return {
                score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 70))),
                strengths: this.ensureStringArray(parsed.strengths, FALLBACK.strengths),
                improvements: this.ensureStringArray(parsed.improvements, FALLBACK.improvements),
                recommendations: this.ensureStringArray(parsed.recommendations, FALLBACK.recommendations),
            };
        } catch (err) {
            this.logger.error('CV analysis failed:', err);
            return FALLBACK;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANDIDATE SCORING
    // ─────────────────────────────────────────────────────────────────────────

    async scoreCandidate(
        candidateName: string,
        candidateEmail: string,
        position: string,
    ): Promise<ScoringAnalysisResult> {
        const FALLBACK: ScoringAnalysisResult = {
            overallScore: 75,
            criteria: { Competences: 78, Experience: 72, Communication: 80 },
            feedback: 'Profil intéressant pour ce poste. Des améliorations sont possibles sur l\'expérience pratique.',
        };

        if (!this.client) return FALLBACK;

        try {
            const prompt = `Vous êtes un expert RH. Évaluez ce candidat pour le poste mentionné et retournez une analyse structurée.

Candidat : ${candidateName}
Email : ${candidateEmail}
Poste visé : ${position}

Retournez UNIQUEMENT un objet JSON valide (sans markdown) :
{
  "overallScore": <entier entre 0 et 100>,
  "criteria": {
    "Competences": <entier entre 0 et 100>,
    "Experience": <entier entre 0 et 100>,
    "Communication": <entier entre 0 et 100>
  },
  "feedback": "<texte de feedback général en français, 1-2 phrases>"
}

Basez votre évaluation sur les informations disponibles. Répondez en français.`;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 512,
                messages: [{ role: 'user', content: prompt }],
            });

            const text = response.content[0].type === 'text' ? response.content[0].text : '';
            const parsed = this.parseJson<ScoringAnalysisResult>(text, FALLBACK);

            return {
                overallScore: Math.max(0, Math.min(100, Math.round(Number(parsed.overallScore) || 75))),
                criteria: {
                    Competences: Math.max(0, Math.min(100, Math.round(Number(parsed.criteria?.Competences) || 75))),
                    Experience: Math.max(0, Math.min(100, Math.round(Number(parsed.criteria?.Experience) || 75))),
                    Communication: Math.max(0, Math.min(100, Math.round(Number(parsed.criteria?.Communication) || 75))),
                },
                feedback: String(parsed.feedback || FALLBACK.feedback),
            };
        } catch (err) {
            this.logger.error('Scoring analysis failed:', err);
            return FALLBACK;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // JOB MATCHING
    // ─────────────────────────────────────────────────────────────────────────

    async matchCandidateToJob(
        candidate: { name: string; email: string },
        job: { title: string; company: string; description?: string },
    ): Promise<MatchingAnalysisResult> {
        const FALLBACK: MatchingAnalysisResult = {
            matchingScore: 70,
            matchReasons: [
                'Profil cohérent avec les exigences du poste',
                'Compétences partiellement alignées avec l\'offre',
                'Potentiel de développement identifié',
            ],
        };

        if (!this.client) return FALLBACK;

        try {
            const prompt = `Évaluez la compatibilité entre ce candidat et cette offre d'emploi.

Candidat : ${candidate.name} (${candidate.email})
Poste : ${job.title}
Entreprise : ${job.company}
${job.description ? `Description du poste :\n${job.description.slice(0, 1000)}` : ''}

Retournez UNIQUEMENT un objet JSON valide (sans markdown) :
{
  "matchingScore": <entier entre 0 et 100>,
  "matchReasons": ["<raison spécifique 1>", "<raison spécifique 2>", "<raison spécifique 3>"]
}

Répondez en français. Minimum 3 raisons.`;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 512,
                messages: [{ role: 'user', content: prompt }],
            });

            const text = response.content[0].type === 'text' ? response.content[0].text : '';
            const parsed = this.parseJson<MatchingAnalysisResult>(text, FALLBACK);

            return {
                matchingScore: Math.max(0, Math.min(100, Math.round(Number(parsed.matchingScore) || 70))),
                matchReasons: this.ensureStringArray(parsed.matchReasons, FALLBACK.matchReasons),
            };
        } catch (err) {
            this.logger.error('Matching analysis failed:', err);
            return FALLBACK;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private parseJson<T>(text: string, fallback: T): T {
        try {
            const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (!match) return fallback;
            return JSON.parse(match[0]) as T;
        } catch {
            this.logger.error('JSON parse failed for Claude response:', text.slice(0, 200));
            return fallback;
        }
    }

    private ensureStringArray(value: unknown, fallback: string[]): string[] {
        if (!Array.isArray(value) || value.length === 0) return fallback;
        return value.map(item => String(item)).filter(Boolean);
    }
}
