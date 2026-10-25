import { IsIn } from 'class-validator';

export class UpdateMatchStatusDto {
  @IsIn(['confirmada', 'descartada'])
  status!: 'confirmada' | 'descartada';
}
