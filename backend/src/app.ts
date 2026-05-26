import 'reflect-metadata';
import express from 'express';
import authRoutes from './routes/auth';
import ordersRoutes from './routes/orders';
import clientsRoutes from './routes/clients';
import inventoryRoutes from './routes/inventory';
import deliveriesRoutes from './routes/deliveries';
import employeesRoutes from './routes/employees';

const app = express();

app.use(express.json());

// CORS для фронтенда
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/employees', employeesRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});


export default app;
