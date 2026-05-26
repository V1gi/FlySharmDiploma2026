import { Router } from 'express';
import { getDeliveries, assignDelivery, updateDeliveryStatus } from '../controllers/deliveriesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getDeliveries);
router.post('/assign', authMiddleware, assignDelivery);
router.patch('/:id/status', authMiddleware, updateDeliveryStatus);

export default router;
