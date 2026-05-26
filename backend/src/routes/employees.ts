import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import { authMiddleware } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Employee);
    const employees = await repo.find();
    return res.json(employees);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const repo = AppDataSource.getRepository(Employee);
    const hash = await bcrypt.hash(password, 10);
    const employee = repo.create({ ...data, passwordHash: hash });
    const saved = await repo.save(employee);
    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;