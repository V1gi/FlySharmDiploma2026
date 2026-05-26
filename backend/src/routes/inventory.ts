import { Router } from 'express';
import { getInventory, getLowStock, addReceipt, addWriteOff, createProduct } from '../controllers/inventoryController';
import { authMiddleware } from '../middleware/auth';


const router = Router();

router.get('/', authMiddleware, getInventory);
router.get('/low-stock', authMiddleware, getLowStock);
router.post('/receipt', authMiddleware, addReceipt);
router.post('/write-off', authMiddleware, addWriteOff);
router.post('/product', authMiddleware, createProduct);

export default router;
