import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CompositionItem } from './CompositionItem';

@Entity()
export class Composition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @OneToMany(() => CompositionItem, item => item.composition)
  items: CompositionItem[];
}
