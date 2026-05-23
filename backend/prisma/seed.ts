import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter } as never);
const BASE_URL = 'https://comunicaapi.pje.jus.br/api/v1';
const ITEMS_PER_PAGE = 100;

interface PjeRecipient {
  polo: string;
  comunicacao_id: number;
  nome: string;
}

interface PjeAdvogado {
  id: number;
  nome: string;
  numero_oab: string;
  uf_oab: string;
}

interface PjeLawyerEntry {
  id: number;
  comunicacao_id: number;
  advogado_id: number;
  advogado: PjeAdvogado;
}

interface PjeItem {
  id: number;
  hash: string;
  siglaTribunal: string;
  nomeOrgao: string;
  tipoComunicacao: string;
  tipoDocumento: string | null;
  nomeClasse: string | null;
  numero_processo: string;
  numeroprocessocommascara: string;
  texto: string;
  meio: string;
  meiocompleto: string;
  link: string | null;
  status: string;
  data_disponibilizacao: string;
  destinatarios: PjeRecipient[];
  destinatarioadvogados: PjeLawyerEntry[];
}

interface PjeResponse {
  items: PjeItem[];
}

async function fetchPage(
  dataInicio: string,
  dataFim: string,
  pagina: number,
): Promise<PjeResponse> {
  const params = new URLSearchParams({
    pagina: String(pagina),
    itensPorPagina: String(ITEMS_PER_PAGE),
    dataDisponibilizacaoInicio: dataInicio,
    dataDisponibilizacaoFim: dataFim,
  });

  const response = await fetch(`${BASE_URL}/comunicacao?${params}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json() as Promise<PjeResponse>;
}

async function fetchDay(dateStr: string): Promise<PjeItem[]> {
  const items: PjeItem[] = [];
  let pagina = 1;

  while (true) {
    const data = await fetchPage(dateStr, dateStr, pagina);
    if (!data.items?.length) break;
    items.push(...data.items);
    if (data.items.length < ITEMS_PER_PAGE) break;
    pagina++;
    await new Promise((r) => setTimeout(r, 50));
  }

  return items;
}

async function upsertCommunication(item: PjeItem) {
  await prisma.communication.upsert({
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

async function seedTestProcess() {
  const processNumber = '0000000-00.2024.8.26.0100';
  const mask = '0000000-00.2024.8.26.0100';

  const communications = [
    { id: 999991, hash: 'test-hash-001', communicationType: 'Intimação', content: 'Fica intimada a parte autora para ciência da decisão proferida nos autos. O feito encontra-se em fase de cumprimento de sentença.', availableAt: new Date('2025-01-05') },
    { id: 999992, hash: 'test-hash-002', communicationType: 'Intimação', content: 'Certifico que a sentença proferida nos presentes autos transitou em julgado em 05/01/2025, tendo em vista o decurso do prazo recursal sem manifestação das partes. Nada mais havendo, arquivem-se os autos.', availableAt: new Date('2025-01-08') },
    { id: 999993, hash: 'test-hash-003', communicationType: 'Citação', content: 'Fica o réu citado para, querendo, contestar a ação no prazo de 15 dias úteis, sob pena de revelia.', availableAt: new Date('2025-01-10') },
    { id: 999994, hash: 'test-hash-004', communicationType: 'Intimação', content: 'Intime-se a parte ré para apresentar contrarrazões ao recurso interposto no prazo legal de 15 dias úteis.', availableAt: new Date('2025-01-12') },
    { id: 999995, hash: 'test-hash-005', communicationType: 'Notificação', content: 'Notifica-se a parte autora para complementar a documentação juntada aos autos, no prazo de 10 dias, sob pena de indeferimento.', availableAt: new Date('2025-01-14') },
    { id: 999996, hash: 'test-hash-006', communicationType: 'Intimação', content: 'Fica intimado o advogado para retirar os autos em carga pelo prazo de 5 dias para fins de vista.', availableAt: new Date('2025-01-15') },
    { id: 999997, hash: 'test-hash-007', communicationType: 'Intimação', content: 'Intime-se para ciência da decisão que deferiu o pedido de tutela antecipada. Cumpra-se imediatamente.', availableAt: new Date('2025-01-17') },
    { id: 999998, hash: 'test-hash-008', communicationType: 'Citação', content: 'Cite-se o litisconsorte passivo necessário para integrar o polo passivo da demanda, no prazo de 15 dias úteis.', availableAt: new Date('2025-01-19') },
  ].map((c) => ({
    ...c,
    courtAcronym: 'TJSP',
    organName: 'Vara Cível Central',
    documentType: null,
    className: 'Procedimento Comum',
    processNumber,
    processNumberMask: mask,
    medium: 'Diário de Justiça Eletrônico',
    mediumFull: 'Diário de Justiça Eletrônico Nacional',
    link: null,
    status: 'disponivel',
  }));

  const recipients = [
    { name: 'Amélia Mascarenhas Macedo', isLawyer: false, pole: 'ativo' },
    { name: 'Paula Silva Santos', isLawyer: true, oabNumber: '123456', oabState: 'SP' },
    { name: 'Lavínia de Jesus', isLawyer: false, pole: 'passivo' },
  ];

  for (const comm of communications) {
    await prisma.communication.upsert({
      where: { hash: comm.hash },
      create: {
        ...comm,
        recipients: { create: recipients },
      },
      update: {},
    });
  }

  console.log('Test process seeded: 8 communications, includes "transitou em julgado"');
}

async function seedDemoUser() {
  const email = 'admin123@email.com';
  const password = 'senha123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Demo user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: 'Administrador Demo',
      email,
      password: hashedPassword,
    },
  });

  console.log(`Demo user created: ${email} / ${password}`);
}

async function main() {
  console.log('Starting seed: fetching last 20 days of communications...');

  let totalSaved = 0;
  const today = new Date('2025-01-20');

  for (let i = 1; i <= 20; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    process.stdout.write(`Fetching ${dateStr}... `);

    try {
      const items = await fetchDay(dateStr);

      for (const item of items) {
        await upsertCommunication(item);
        totalSaved++;
      }

      console.log(`${items.length} communications saved`);
    } catch (err) {
      console.log(`error: ${err}`);
    }
  }

  console.log(`\nSeed complete: ${totalSaved} total communications saved.`);
  await seedTestProcess();
  await seedDemoUser();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
