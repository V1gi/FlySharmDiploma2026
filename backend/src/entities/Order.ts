import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Client } from './Client';
import { OrderItem } from './OrderItem';
import { Delivery } from './Delivery';

export enum OrderStatus {
  NEW = 'new',
  IN_PRODUCTION = 'in_production',
  READY = 'ready',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, client => client.orders)
  client: Client;

  @Column()
  clientId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date' })
  deliveryDate: string;

  @Column()
  deliveryAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @OneToMany(() => Delivery, delivery => delivery.order)
  deliveries: Delivery[];
}
