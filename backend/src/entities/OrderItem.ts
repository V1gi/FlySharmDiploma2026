import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtTime: number;
}
