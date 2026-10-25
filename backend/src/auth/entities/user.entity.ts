import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportEntity } from 'src/reports/entities/report.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 200 })
  email!: string;

  @Column({ length: 200, name: 'password_hash', select: false })
  passwordHash!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 20, default: 'usuario' })
  role!: 'usuario' | 'administrador';

  @OneToMany(() => ReportEntity, (report) => report.user) //Llave foranea
  reports!: ReportEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
