import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from './Product';

export enum MovementType {
  RECEIPT = 'receipt',
  WRITE_OFF = 'write_off',
}

@Entity()
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: number;

  @Column({ type: 'enum', enum: MovementType })
  movementType: MovementType;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  orderId: number;
}
