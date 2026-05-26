import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient } from '../controllers/clientsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getClients);
router.get('/:id', authMiddleware, getClientById);
router.post('/', authMiddleware, createClient);
router.put('/:id', authMiddleware, updateClient);

export default router;
