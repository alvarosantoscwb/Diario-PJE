'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Calendar, Users, FileText, AlertCircle, Sparkles, Loader2, X, Scale, Clock } from 'lucide-react';
import { getProcessDetails, generateSummary } from '@/services/communications';
import { Communication } from '@/types/communication';

interface ProcessDetails {
  processNumber: string;
  courtAcronym: string | null;
  hasTransitadoEmJulgado: boolean;
  communications: Communication[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function recipientNames(communication: Communication): string {
  return communication.recipients.map((r) => r.name).join(', ') || '—';
}

function HighlightedText({ text }: { text: string }) {
  const term = 'transitou em julgado';
  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);

  return (
    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        part.toLowerCase() === term ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </p>
  );
}

function SummaryDialog({ summary, loading, error, onClose, onRetry }: {
  summary: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#0D4897]" />
            <h2 className="text-base font-semibold text-[#262626]">Resumo com IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-[#0D4897]" />
            </div>
          ) : error ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={onRetry} className="text-sm text-[#0D4897] hover:underline self-start cursor-pointer">
                Tentar novamente
              </button>
            </div>
          ) : summary ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CommunicationDetail({ communication }: { communication: Communication }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateSummary(communication.id);
      setSummary(result.summary);
    } catch {
      setError('Erro ao gerar resumo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleResumirClick() {
    setDialogOpen(true);
    if (!summary && !loading) generate();
  }

  return (
    <>
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6">
        {/* Mobile: botão acima | Desktop: botão à direita */}
        <div className="flex sm:hidden justify-start mb-3">
          <button
            onClick={handleResumirClick}
            className="flex items-center gap-1.5 text-sm text-[#0D4897] border border-[#0D4897] px-3 py-1 rounded-lg hover:bg-[#0D4897]/5 transition cursor-pointer"
          >
            <Sparkles size={13} />
            Resumir
          </button>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">Data</span>
              </div>
              <span className="text-sm text-gray-800">{formatDate(communication.availableAt)}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">Destinatários</span>
              </div>
              <span className="text-sm text-gray-800">{recipientNames(communication)}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">Conteúdo da movimentação</span>
              </div>
              <HighlightedText text={communication.content} />
            </div>
          </div>

          <button
            onClick={handleResumirClick}
            className="hidden sm:flex items-center gap-1.5 text-sm text-[#0D4897] border border-[#0D4897] px-3 py-1 rounded-lg hover:bg-[#0D4897]/5 transition cursor-pointer shrink-0"
          >
            <Sparkles size={13} />
            Resumir
          </button>
        </div>
      </div>

      {dialogOpen && (
        <SummaryDialog
          summary={summary}
          loading={loading}
          error={error}
          onClose={() => setDialogOpen(false)}
          onRetry={generate}
        />
      )}
    </>
  );
}

export default function ProcessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const processNumber = decodeURIComponent(params.processNumber as string);

  const [details, setDetails] = useState<ProcessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    getProcessDetails(processNumber)
      .then(setDetails)
      .catch(() => setError('Erro ao carregar detalhes do processo.'))
      .finally(() => setLoading(false));
  }, [processNumber]);

  const allRecipients = details
    ? [...new Set(details.communications.flatMap((c) => c.recipients.map((r) => r.name)))].join(', ')
    : '';

  const totalPages = details ? Math.ceil(details.communications.length / PAGE_SIZE) : 1;
  const paginatedCommunications = details
    ? details.communications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          Diário Oficial
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-[#262626] font-medium">Detalhes do processo</span>
      </nav>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#0D4897]" />
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : details ? (
        <div className="flex flex-col gap-4">
          {/* Header do processo */}
          <div className="border border-gray-300 p-6 rounded-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-xl font-bold text-[#262626]">
                {[
                  details.communications[0]?.processNumberMask || details.processNumber,
                  details.communications[0]?.className,
                ].filter(Boolean).join(' - ')}
              </h1>
              {details.hasTransitadoEmJulgado && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full self-start shrink-0" style={{ backgroundColor: '#FEF2EC', color: '#9D231C' }}>
                  <AlertCircle size={13} />
                  Transitou em julgado
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-3 text-sm text-[#262626]">
              {details.courtAcronym && (
                <span className="flex items-center gap-1.5">
                  <Scale size={13} className="text-[#6D6D6E]" />
                  {details.courtAcronym}
                </span>
              )}
              {allRecipients && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-[#6D6D6E]" />
                  {allRecipients}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                {details.communications.length} {details.communications.length === 1 ? 'atualização' : 'atualizações'}
              </span>
            </div>
          </div>

          {/* Cards de comunicação */}
          <div className="flex flex-col gap-3">
            {paginatedCommunications.map((c) => (
              <CommunicationDetail key={c.id} communication={c} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-[#262626] transition cursor-pointer"
              >
                <ChevronRight size={14} className="rotate-180" />
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm text-[#262626] transition cursor-pointer hover:bg-gray-50 ${p === page ? 'border border-[#D4D4D4]' : ''}`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm text-[#262626] transition cursor-pointer"
              >
                Próximo
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>
      ) : null}
    </div>
  );
}
