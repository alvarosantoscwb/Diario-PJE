import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Communications')
@ApiBearerAuth()
@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comunicações com filtros e paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'dataInicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dataFim', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'tribunal', required: false, example: 'TJSP' })
  @ApiQuery({ name: 'numeroProcesso', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada de comunicações' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('tribunal') tribunal?: string,
    @Query('numeroProcesso') numeroProcesso?: string,
  ) {
    return this.communicationsService.findAll({
      page,
      limit,
      dataInicio,
      dataFim,
      tribunal,
      numeroProcesso,
    });
  }

  @Get('process/:processNumber')
  @ApiOperation({ summary: 'Buscar detalhes de um processo pelo número' })
  @ApiResponse({ status: 200, description: 'Detalhes do processo com comunicações' })
  @ApiResponse({ status: 404, description: 'Processo não encontrado' })
  findByProcess(@Param('processNumber') processNumber: string) {
    return this.communicationsService.findByProcess(processNumber);
  }

  @Post(':id/summary')
  @ApiOperation({ summary: 'Gerar resumo com IA para uma comunicação' })
  @ApiResponse({ status: 200, description: 'Resumo gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Comunicação não encontrada' })
  generateSummary(@Param('id', ParseIntPipe) id: number) {
    return this.communicationsService.generateSummary(id);
  }
}
