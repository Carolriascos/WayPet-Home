import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsIn(['perdida', 'encontrada'])
  type!: 'perdida' | 'encontrada';

  @IsDateString()
  eventDate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  petName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  breed!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  color!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  size!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  sex!: string;

  @IsString()
  @IsOptional()
  characteristics?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  photoUrl?: string;
}
