import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Employee } from './Employee';

export enum DeliveryStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.deliveries)
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(() => Employee)
  courier: Employee;

  @Column()
  courierId: number;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.ASSIGNED })
  deliveryStatus: DeliveryStatus;

  @Column({ nullable: true })
  courierComment: string;
}
