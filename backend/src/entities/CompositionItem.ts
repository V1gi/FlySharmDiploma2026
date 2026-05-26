import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Composition } from './Composition';
import { Product } from './Product';

@Entity()
export class CompositionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Composition, composition => composition.items)
  composition: Composition;

  @Column()
  compositionId: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: number;

  @Column()
  quantity: number;
}
