import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Client } from '../entities/Client';
import { AuthRequest } from '../middleware/auth';

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Client);
    const clients = await repo.find({ order: { fullName: 'ASC' } });
    return res.json(clients);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Client);
    const client = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['orders'],
    });
    if (!client) return res.status(404).json({ message: 'Клиент не найден' });
    return res.json(client);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Client);
    const client = repo.create(req.body);
    const saved = await repo.save(client);
    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Client);
    const client = await repo.findOne({ where: { id: Number(req.params.id) } });
    if (!client) return res.status(404).json({ message: 'Клиент не найден' });

    Object.assign(client, req.body);
    const updated = await repo.save(client);
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};
