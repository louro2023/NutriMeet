import termsContent from './legal/termos-de-uso.md?raw';
import privacyContent from './legal/politica-de-privacidade.md?raw';
import ethicsContent from './legal/codigo-de-etica.md?raw';

export const legalDocuments = {
  'termos-de-uso': {
    title: 'Termos de Uso',
    label: 'Termos de uso',
    description: 'Regras de uso da NutriMeet para pacientes, nutricionistas e visitantes.',
    updatedAt: '08 de julho de 2026',
    content: termsContent,
  },
  'politica-de-privacidade': {
    title: 'Política de Privacidade',
    label: 'Política de privacidade',
    description: 'Como a NutriMeet coleta, utiliza, protege e trata dados pessoais.',
    updatedAt: '08 de julho de 2026',
    content: privacyContent,
  },
  'codigo-de-etica': {
    title: 'Código de Ética Profissional',
    label: 'Código de ética profissional',
    description: 'Princípios de conduta esperados para uso responsável da plataforma.',
    updatedAt: '08 de julho de 2026',
    content: ethicsContent,
  },
} as const;

export type LegalDocumentSlug = keyof typeof legalDocuments;

export const legalDocumentLinks: Array<{ slug: LegalDocumentSlug; label: string }> = [
  { slug: 'termos-de-uso', label: legalDocuments['termos-de-uso'].label },
  { slug: 'politica-de-privacidade', label: legalDocuments['politica-de-privacidade'].label },
  { slug: 'codigo-de-etica', label: legalDocuments['codigo-de-etica'].label },
];
