import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Groq from 'groq-sdk';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunicationsService {
  private readonly groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    dataInicio?: string;
    dataFim?: string;
    tribunal?: string;
    numeroProcesso?: string;
  }) {
    const { page, limit, dataInicio, dataFim, tribunal, numeroProcesso } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.communicationWhereInput = {};

    if (dataInicio || dataFim) {
      where.availableAt = {
        ...(dataInicio && { gte: new Date(dataInicio) }),
        ...(dataFim && { lte: new Date(dataFim) }),
      };
    }

    if (tribunal) {
      where.courtAcronym = { contains: tribunal, mode: 'insensitive' };
    }

    if (numeroProcesso) {
      where.processNumber = { contains: numeroProcesso };
    }

    const [data, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { availableAt: 'desc' },
        include: { recipients: true },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByProcess(processNumber: string) {
    const communications = await this.prisma.communication.findMany({
      where: { processNumber },
      orderBy: { availableAt: 'desc' },
      include: { recipients: true },
    });

    const hasTransitadoEmJulgado = communications.some((c) =>
      c.content.toLowerCase().includes('transitou em julgado'),
    );

    return {
      processNumber,
      courtAcronym: communications[0]?.courtAcronym ?? null,
      hasTransitadoEmJulgado,
      communications,
    };
  }

  async generateSummary(id: number) {
    const communication = await this.prisma.communication.findUnique({ where: { id } });

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    const message = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Você é um assistente jurídico. Resuma o seguinte texto de comunicação processual em no máximo 3 parágrafos curtos, destacando as informações mais relevantes:\n\n${communication.content}`,
        },
      ],
    });

    const summary = message.choices[0]?.message?.content ?? '';

    return { summary };
  }
}
