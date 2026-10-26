
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
import { ClueEntity } from './entities/clue.entity';
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

private toSafeResponse(clue: ClueEntity) {
  const {
    user: _user,
    ...safeClue
  } = clue;

  return safeClue;
}

  
@Post()
@Roles('usuario', 'administrador')
async create(
  @Body() dto: CreateClueDto,
  @CurrentUser() user: AuthUser,
) {
  const clue = await this.cluesService.create(dto, user);
  return this.toSafeResponse(clue);
}


  @Get()
  @Roles('usuario', 'administrador')
  findAll() {
    return this.cluesService.findAll();
  }

  
@Get(':id')
@Roles('usuario', 'administrador')
async findOne(@Param('id', ParseIntPipe) id: number) {
  const clue = await this.cluesService.findOne(id);
  return this.toSafeResponse(clue);
}

@Patch(':id')
@Roles('usuario', 'administrador')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateClueDto,
  @CurrentUser() user: AuthUser,
) {
  const clue = await this.cluesService.update(id, dto, user);
  return this.toSafeResponse(clue);
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
