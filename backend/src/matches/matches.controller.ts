import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { MatchesService } from './matches.service';

const requestValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get('report/:reportId')
  findByReport(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.matchesService.findByReport(reportId);
  }

  @Post('report/:reportId')
  generateForReport(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.matchesService.generateForReport(reportId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(requestValidationPipe) updateMatchStatusDto: UpdateMatchStatusDto,
  ) {
    return this.matchesService.updateStatus(id, updateMatchStatusDto);
  }
}
