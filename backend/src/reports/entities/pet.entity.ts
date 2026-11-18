import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pets')
export class PetEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name!: string | null;

  @Column({ length: 100 })
  breed!: string;

  @Column({ length: 50 })
  color!: string;

  @Column({ length: 20 })
  size!: string;

  @Column({ length: 20 })
  sex!: string;

  @Column({ type: 'text', nullable: true })
  characteristics!: string | null;

  @Column({ type: 'varchar', length: 300, name: 'photo_url', nullable: true })
  photoUrl!: string | null;
}
