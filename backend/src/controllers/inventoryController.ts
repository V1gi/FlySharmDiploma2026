import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { InventoryMovement, MovementType } from '../entities/InventoryMovement';
import { AuthRequest } from '../middleware/auth';

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Product);
    const products = await repo.find({ order: { name: 'ASC' } });
    return res.json(products);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getLowStock = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Product);
    const products = await repo
      .createQueryBuilder('product')
      .where('product.currentQuantity < :min', { min: 10 })
      .getMany();
    return res.json(products);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const addReceipt = async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const movementRepo = AppDataSource.getRepository(InventoryMovement);

    const product = await productRepo.findOne({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    product.currentQuantity += Number(quantity);
    await productRepo.save(product);

    const movement = movementRepo.create({
      productId,
      quantity,
      movementType: MovementType.RECEIPT,
    });
    await movementRepo.save(movement);

    return res.json({ message: 'Поступление зафиксировано', product });
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const addWriteOff = async (req: AuthRequest, res: Response) => {
  const { productId, quantity, orderId } = req.body;
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const movementRepo = AppDataSource.getRepository(InventoryMovement);

    const product = await productRepo.findOne({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    if (product.currentQuantity < quantity) {
      return res.status(400).json({ message: 'Недостаточно товара на складе' });
    }

    product.currentQuantity -= Number(quantity);
    await productRepo.save(product);

    const movement = movementRepo.create({
      productId,
      quantity,
      movementType: MovementType.WRITE_OFF,
      orderId: orderId || null,
    });
    await movementRepo.save(movement);

    return res.json({ message: 'Списание зафиксировано', product });
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Product);
    const product = repo.create(req.body);
    const saved = await repo.save(product);
    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};
