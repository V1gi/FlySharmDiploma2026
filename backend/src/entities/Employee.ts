import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ASSEMBLER = 'assembler',
  COURIER = 'courier',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: EmployeeRole, default: EmployeeRole.MANAGER })
  role: EmployeeRole;
}
