import { DataSource } from 'typeorm';
import { Order } from '../entities/Order';
import { Client } from '../entities/Client';
import { Product } from '../entities/Product';
import { Employee } from '../entities/Employee';
import { Delivery } from '../entities/Delivery';
import { OrderItem } from '../entities/OrderItem';
import { InventoryMovement } from '../entities/InventoryMovement';
import { Composition } from '../entities/Composition';
import { CompositionItem } from '../entities/CompositionItem';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Order, Client, Product, Employee, Delivery, OrderItem, InventoryMovement, Composition, CompositionItem],
});
