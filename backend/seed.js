const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Table = require('./models/Table');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Table.deleteMany({});
    console.log('Cleared existing Users and Tables.');

    // --- Seed Admin User ---
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'Admin',
    });
    console.log(`Admin created: ${admin.email} / password: admin123`);

    // --- Seed a Customer User (for quick testing) ---
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customer123',
      role: 'Customer',
    });
    console.log(`Customer created: ${customer.email} / password: customer123`);

    // --- Seed Tables ---
    const tables = [
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 6 },
      { tableNumber: 7, capacity: 8 },
      { tableNumber: 8, capacity: 8 },
      { tableNumber: 9, capacity: 10 },
      { tableNumber: 10, capacity: 12 },
    ];

    await Table.insertMany(tables);
    console.log(`${tables.length} tables seeded successfully.`);

    console.log('\n--- Seed Summary ---');
    console.log('Admin:    admin@restaurant.com / admin123');
    console.log('Customer: john@example.com / customer123');
    console.log(`Tables:   ${tables.length} tables (capacity 2-12)`);
    console.log('--------------------\n');

    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
