
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CluesService } from './clues.service';
import { CreateClueDto, UpdateClueDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('clues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CluesController {
  constructor(
    private readonly cluesService: CluesService,
  ) {}

  @Post()
  @Roles('usuario', 'administrador')
  create(
    @Body() dto: CreateClueDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.cluesService.create(dto, user);
  }

  @Get()
  @Roles('usuario', 'administrador')
  findAll() {
    return this.cluesService.findAll();
  }

  @Get(':id')
  @Roles('usuario', 'administrador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cluesService.findOne(id);
  }

  @Patch(':id')
  @Roles('usuario', 'administrador')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClueDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.cluesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('usuario', 'administrador')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.cluesService.remove(id, user);
  }
}
