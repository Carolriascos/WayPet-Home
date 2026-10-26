import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

const requestValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

type AuthenticatedRequest = {
  user: { id: number; email: string; role: string };
};

@Controller('reports')
@UseGuards(JwtAuthGuard) // Todas las rutas quedan protegidas: se necesita un token valido
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(
    @Body(requestValidationPipe) createReportDto: CreateReportDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.create(createReportDto, request.user.id);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('mine')
  findMine(@Req() request: AuthenticatedRequest) {
    return this.reportsService.findMine(request.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(requestValidationPipe) updateReportDto: UpdateReportDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.update(id, updateReportDto, request.user);
  }
}
