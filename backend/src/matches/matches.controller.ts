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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
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
  findAll(@CurrentUser() user: AuthUser) {
    return this.matchesService.findAll(user);
  }

  @Get('report/:reportId')
  findByReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.matchesService.findByReport(reportId, user);
  }

  @Post('report/:reportId')
  generateForReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.matchesService.generateForReport(reportId, user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(requestValidationPipe) updateMatchStatusDto: UpdateMatchStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.matchesService.updateStatus(id, updateMatchStatusDto, user);
  }
}
