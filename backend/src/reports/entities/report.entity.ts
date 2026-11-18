import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { PetEntity } from './pet.entity';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  type!: 'perdida' | 'encontrada';

  @Column({ type: 'date', name: 'event_date' })
  eventDate!: string;

  @Column({ length: 200 })
  location!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 20, default: 'activo' })
  status!: 'activo' | 'resuelto';

  @ManyToOne(() => UserEntity, (user) => user.reports, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @OneToOne(() => PetEntity, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn({ name: 'pet_id' })
  pet!: PetEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
