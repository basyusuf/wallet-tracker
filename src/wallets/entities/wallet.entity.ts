import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WalletsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  wallet_address: string;
}