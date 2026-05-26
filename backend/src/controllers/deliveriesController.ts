import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Delivery, DeliveryStatus } from '../entities/Delivery';
import { AuthRequest } from '../middleware/auth';

export const getDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const deliveries = await repo.find({
      relations: ['order', 'courier'],
      order: { id: 'DESC' },
    });
    return res.json(deliveries);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const assignDelivery = async (req: AuthRequest, res: Response) => {
  const { orderId, courierId } = req.body;
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const delivery = repo.create({ orderId, courierId, deliveryStatus: DeliveryStatus.ASSIGNED });
    const saved = await repo.save(delivery);
    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const delivery = await repo.findOne({ where: { id: Number(req.params.id) } });
    if (!delivery) return res.status(404).json({ message: 'Доставка не найдена' });

    delivery.deliveryStatus = req.body.status as DeliveryStatus;
    if (req.body.courierComment) delivery.courierComment = req.body.courierComment;
    const updated = await repo.save(delivery);
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};
