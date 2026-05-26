import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus } from '../entities/Order';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../entities/Product';
import { OrderItem } from '../entities/OrderItem';
import { InventoryMovement, MovementType } from '../entities/InventoryMovement';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Order);
    const orders = await repo.find({
      relations: ['client', 'items'],
      order: { createdAt: 'DESC' },
    });
    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Order);
    const order = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['client', 'items', 'deliveries'],
    });
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    return res.json(order);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderRepo = AppDataSource.getRepository(Order);
    const itemRepo = AppDataSource.getRepository(OrderItem);
    const productRepo = AppDataSource.getRepository(Product);
    const movementRepo = AppDataSource.getRepository(InventoryMovement);

    const { items, ...orderData } = req.body;

    const order = orderRepo.create(orderData as Partial<Order>);
    const saved = await orderRepo.save(order as Order);
    const orderId: number = (saved as any).id;

    const savedOrder = await orderRepo.findOne({ where: { id: orderId } });
    if (!savedOrder) return res.status(500).json({ message: 'Ошибка сохранения заказа' });

    if (items && items.length > 0) {
      for (const item of items) {
        const product = await productRepo.findOne({ where: { id: item.productId } });
        if (!product) continue;

        await itemRepo.save(itemRepo.create({
          orderId: orderId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: product.retailPrice,
        }));

        product.currentQuantity -= Number(item.quantity);
        await productRepo.save(product);

        await movementRepo.save(movementRepo.create({
          productId: item.productId,
          quantity: item.quantity,
          movementType: MovementType.WRITE_OFF,
          orderId: orderId,
        }));
      }
    }

    return res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Order);
    const order = await repo.findOne({ where: { id: Number(req.params.id) } });
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    order.status = req.body.status as OrderStatus;
    const updated = await repo.save(order);
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderRepo = AppDataSource.getRepository(Order);
    const itemRepo = AppDataSource.getRepository(OrderItem);
    const movementRepo = AppDataSource.getRepository(InventoryMovement);

    const order = await orderRepo.findOne({ where: { id: Number(req.params.id) } });
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    // Сначала удаляем связанные записи
    await movementRepo.delete({ orderId: Number(req.params.id) });
    await itemRepo.delete({ orderId: Number(req.params.id) });
    await orderRepo.remove(order);

    return res.json({ message: 'Заказ удалён' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};
