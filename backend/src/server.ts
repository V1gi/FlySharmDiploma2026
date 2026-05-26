import 'reflect-metadata';
import 'dotenv/config';
import app from './app';
import { AppDataSource } from './config/database';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к базе данных:', error);
  });
