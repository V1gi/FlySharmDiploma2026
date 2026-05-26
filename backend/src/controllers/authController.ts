import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const repo = AppDataSource.getRepository(Employee);
    const employee = await repo.findOne({ where: { email } });

    if (!employee) {
      return res.status(401).json({ message: 'Сотрудник не найден' });
    }

    const isValid = await bcrypt.compare(password, employee.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { id: employee.id, role: employee.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return res.json({ token, role: employee.role, name: employee.fullName });
  } catch {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};
