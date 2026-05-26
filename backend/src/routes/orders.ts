import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } from '../controllers/ordersController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, createOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
