import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не передан' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Токен недействителен' });
  }
};
