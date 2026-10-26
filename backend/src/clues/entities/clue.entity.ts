
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../auth/entities/user.entity';
import { ReportEntity } from '../../reports/entities/report.entity';

@Entity('clues')
export class ClueEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relación con el reporte
  @ManyToOne(() => ReportEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_id' })
  report!: ReportEntity;

  // Relación con el usuario que creó la pista
  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  // Descripción de la pista
  @Column({ type: 'text' })
  description!: string;

  // Lugar donde fue vista la mascota
  @Column({ type: 'varchar', length: 200 })
  location!: string;

  // Fecha y hora del avistamiento
  @Column({ type: 'timestamptz', name: 'sighted_at' })
  sightedAt!: Date;

  // Coordenadas opcionales
  @Column({
    type: 'double precision',
    nullable: true,
  })
  latitude!: number | null;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  longitude!: number | null;

  // Fotografía opcional
  @Column({
    type: 'varchar',
    length: 500,
    name: 'photo_url',
    nullable: true,
  })
  photoUrl!: string | null;

  // Fecha de creación de la pista
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
