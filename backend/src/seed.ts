import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './config/database';
import { Employee, EmployeeRole } from './entities/Employee';
import { Client } from './entities/Client';
import { Product } from './entities/Product';
import bcrypt from 'bcryptjs';

AppDataSource.initialize().then(async () => {
  const employeeRepo = AppDataSource.getRepository(Employee);
  const clientRepo = AppDataSource.getRepository(Client);
  const productRepo = AppDataSource.getRepository(Product);

  // Сотрудники
  const employees = [
    { fullName: 'Администратор', email: 'admin@flysharm.ru', password: 'admin123', role: EmployeeRole.ADMIN },
    { fullName: 'Иванова Мария', email: 'manager@flysharm.ru', password: 'manager123', role: EmployeeRole.MANAGER },
    { fullName: 'Петров Алексей', email: 'assembler@flysharm.ru', password: 'assembler123', role: EmployeeRole.ASSEMBLER },
    { fullName: 'Сидоров Дмитрий', email: 'courier@flysharm.ru', password: 'courier123', role: EmployeeRole.COURIER },
  ];

  for (const emp of employees) {
    const exists = await employeeRepo.findOne({ where: { email: emp.email } });
    if (!exists) {
      const hash = await bcrypt.hash(emp.password, 10);
      await employeeRepo.save(employeeRepo.create({
        fullName: emp.fullName,
        email: emp.email,
        passwordHash: hash,
        role: emp.role,
      }));
      console.log(`✅ Сотрудник создан: ${emp.fullName}`);
    }
  }

  // Клиенты
  const clients = [
    { fullName: 'Смирнова Анна Петровна', phone: '+7 (916) 123-45-67', email: 'smirnova@mail.ru', address: 'г. Москва, ул. Ленина, д. 10' },
    { fullName: 'Козлов Игорь Викторович', phone: '+7 (926) 987-65-43', email: 'kozlov@gmail.com', address: 'г. Москва, пр. Мира, д. 55' },
    { fullName: 'Новикова Елена', phone: '+7 (903) 555-11-22', email: null, address: 'г. Москва, ул. Садовая, д. 3' },
  ];

  for (const cl of clients) {
    const exists = await clientRepo.findOne({ where: { phone: cl.phone } });
    if (!exists) {
      await clientRepo.save(clientRepo.create(cl));
      console.log(`✅ Клиент создан: ${cl.fullName}`);
    }
  }

  // Товары
  const products = [
    { name: 'Шар латексный 30 см красный', category: 'Латексные шары', color: 'красный', purchasePrice: 15, retailPrice: 45, currentQuantity: 150 },
    { name: 'Шар латексный 30 см синий', category: 'Латексные шары', color: 'синий', purchasePrice: 15, retailPrice: 45, currentQuantity: 120 },
    { name: 'Шар фольгированный звезда золото', category: 'Фольгированные шары', color: 'золотой', purchasePrice: 80, retailPrice: 250, currentQuantity: 45 },
    { name: 'Шар фольгированный сердце розовый', category: 'Фольгированные шары', color: 'розовый', purchasePrice: 90, retailPrice: 280, currentQuantity: 8 },
    { name: 'Гелий (баллон 10 л)', category: 'Расходные материалы', color: null, purchasePrice: 1200, retailPrice: 2500, currentQuantity: 5 },
    { name: 'Лента декоративная золотая', category: 'Расходные материалы', color: 'золотой', purchasePrice: 30, retailPrice: 80, currentQuantity: 200 },
  ];

  for (const pr of products) {
    const exists = await productRepo.findOne({ where: { name: pr.name } });
    if (!exists) {
      await productRepo.save(productRepo.create(pr));
      console.log(`✅ Товар создан: ${pr.name}`);
    }
  }

  console.log('\n🎉 Тестовые данные успешно загружены!');
  console.log('\nУчётные данные для входа:');
  console.log('  Администратор: admin@flysharm.ru / admin123');
  console.log('  Менеджер:      manager@flysharm.ru / manager123');
  console.log('  Сборщик:       assembler@flysharm.ru / assembler123');
  console.log('  Курьер:        courier@flysharm.ru / courier123');

  process.exit(0);
}).catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
