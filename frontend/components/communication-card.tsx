import { Communication } from '@/types/communication';
import { CalendarDays, Gavel, CircleAlert, UsersRound, FileText, Scale } from 'lucide-react';

interface Props {
  communication: Communication;
  onClick: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function recipientNames(communication: Communication): string {
  return communication.recipients.map((r) => r.name).join(', ') || '—';
}

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export function CommunicationCardSkeleton() {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-6 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-muted rounded shrink-0" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-4 w-36 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-muted rounded shrink-0" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-muted rounded shrink-0" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function CommunicationCard({ communication, onClick }: Props) {
  const processLabel = [
    communication.processNumberMask || communication.processNumber,
    communication.className,
  ].filter(Boolean).join(' - ');

  return (
    <div
      onClick={onClick}
      className="bg-card border border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
          <Field icon={Scale} label="Processo" value={processLabel} />
          <Field icon={CalendarDays} label="Data" value={formatDate(communication.availableAt)} />
          <Field icon={Gavel} label="Tribunal" value={communication.courtAcronym} />
          <Field icon={CircleAlert} label="Tipo da comunicação" value={communication.communicationType} />
        </div>
        <Field icon={UsersRound} label="Destinatários" value={recipientNames(communication)} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Conteúdo</span>
          </div>
          <span className="text-sm text-foreground line-clamp-2">{communication.content}</span>
        </div>
      </div>
    </div>
  );
}
