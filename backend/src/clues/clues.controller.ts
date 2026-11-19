
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
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
  constructor(private readonly cluesService: CluesService) {}

  private toSafeResponse(clue: ClueEntity) {
    const { user: _user, ...safeClue } = clue;
    return safeClue;
  }

  @Post()
  @Roles('usuario', 'administrador')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
  const uploadDir = join(__dirname, '..', '..', 'uploads', 'clues');

  mkdirSync(uploadDir, { recursive: true });

  callback(null, uploadDir);
},
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ];

        if (!allowed.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes JPG, PNG, WEBP o GIF.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateClueDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    const clue = await this.cluesService.create(
      {
        ...dto,
        photoUrl: file
          ? `/uploads/clues/${file.filename}`
          : dto.photoUrl,
      },
      user,
    );

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
