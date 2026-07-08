import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { legalDocuments, type LegalDocumentSlug } from '../content/legalDocuments';

type LegalBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'divider' };

export function LegalDocument() {
  const { slug } = useParams();

  if (!isLegalDocumentSlug(slug)) {
    return <Navigate to="/" replace />;
  }

  const legalDocument = legalDocuments[slug];
  const blocks = parseLegalContent(legalDocument.content);

  return (
    <div className="min-h-screen bg-[#f7fbf3]">
      <section className="bg-emerald-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button asChild variant="outline" className="mb-8 border-white/20 bg-white/10 text-white hover:bg-white hover:text-emerald-950">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lime-300 text-emerald-950">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-3 text-sm font-bold uppercase text-lime-200">Documento NutriMeet</p>
              <h1 className="font-serif text-4xl font-extrabold sm:text-5xl">{legalDocument.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50/75">{legalDocument.description}</p>
              <p className="mt-4 text-sm font-semibold text-lime-100">Última atualização: {legalDocument.updatedAt}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="rounded-lg border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-10">
          <div className="space-y-5">
            {blocks.map((block, index) => (
              <LegalBlockView key={`${block.type}-${index}`} block={block} />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === 'heading') {
    return (
      <h2 className="pt-3 font-serif text-2xl font-extrabold leading-tight text-emerald-950">
        {block.text}
      </h2>
    );
  }

  if (block.type === 'list') {
    return (
      <ul className="list-disc space-y-2 pl-6 leading-7 text-slate-600">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'divider') {
    return <hr className="border-emerald-100" />;
  }

  return <p className="leading-8 text-slate-600">{block.text}</p>;
}

function parseLegalContent(content: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  const listItems: string[] = [];
  let skippedTitle = false;

  const pushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: [...listItems] });
      listItems.length = 0;
    }
  };

  content.replace(/^\uFEFF/, '').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      pushList();
      return;
    }

    const withoutHeadingMarker = trimmed.replace(/^#{1,6}\s+/, '');
    const text = cleanInlineText(withoutHeadingMarker);
    const normalized = normalizeText(text);

    if (!skippedTitle) {
      skippedTitle = true;
      return;
    }

    if (normalized.includes('ultima atualizacao') || normalized.includes('ltima atualiza')) {
      return;
    }

    if (trimmed === '---') {
      pushList();
      blocks.push({ type: 'divider' });
      return;
    }

    if (/^#{2,6}\s+/.test(trimmed) || /^\d+\.\s+\S/.test(trimmed)) {
      pushList();
      blocks.push({ type: 'heading', text });
      return;
    }

    if (/^[*-]\s+/.test(trimmed)) {
      listItems.push(cleanInlineText(trimmed.replace(/^[*-]\s+/, '')));
      return;
    }

    pushList();
    blocks.push({ type: 'paragraph', text });
  });

  pushList();
  return blocks;
}

function cleanInlineText(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, '$1').trim();
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isLegalDocumentSlug(slug: string | undefined): slug is LegalDocumentSlug {
  return Boolean(slug && Object.prototype.hasOwnProperty.call(legalDocuments, slug));
}
