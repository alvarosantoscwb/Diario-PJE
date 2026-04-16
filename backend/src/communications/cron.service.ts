import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PjeService, PjeItem } from '../pje/pje.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly pjeService: PjeService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('0 1 * * *')
  async syncPreviousDay() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    this.logger.log(`Starting sync for ${dateStr}`);

    let count = 0;
    let error: string | null = null;

    try {
      const items = await this.pjeService.fetchAll(dateStr, dateStr);

      for (const item of items) {
        await this.upsertCommunication(item);
        count++;
      }

      this.logger.log(`Sync complete: ${count} records for ${dateStr}`);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Sync failed: ${error}`);
    }

    await this.prisma.syncLog.create({
      data: { status: error ? 'error' : 'success', count, error },
    });
  }

  async upsertCommunication(item: PjeItem) {
    await this.prisma.communication.upsert({
      where: { hash: item.hash },
      create: {
        id: item.id,
        hash: item.hash,
        courtAcronym: item.siglaTribunal,
        organName: item.nomeOrgao,
        communicationType: item.tipoComunicacao,
        documentType: item.tipoDocumento,
        className: item.nomeClasse,
        processNumber: item.numero_processo,
        processNumberMask: item.numeroprocessocommascara,
        content: item.texto,
        medium: item.meio,
        mediumFull: item.meiocompleto,
        link: item.link,
        status: item.status,
        availableAt: new Date(item.data_disponibilizacao),
        recipients: {
          create: [
            ...item.destinatarios.map((d) => ({
              name: d.nome,
              pole: d.polo,
              isLawyer: false,
            })),
            ...item.destinatarioadvogados.map((a) => ({
              name: a.advogado.nome,
              isLawyer: true,
              oabNumber: a.advogado.numero_oab,
              oabState: a.advogado.uf_oab,
            })),
          ],
        },
      },
      update: {},
    });
  }
}
