import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ReportEntity } from '../../reports/entities/report.entity';

@Entity('matches')
@Unique(['lostReport', 'foundReport'])
export class MatchEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'similarity_percentage' })
  similarityPercentage!: number;

  @Column({ type: 'text', name: 'matching_features' })
  matchingFeatures!: string;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  status!: 'pendiente' | 'confirmada' | 'descartada';

  @ManyToOne(() => ReportEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'lost_report_id' })
  lostReport!: ReportEntity;

  @ManyToOne(() => ReportEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'found_report_id' })
  foundReport!: ReportEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
