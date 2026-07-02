const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Table = require('./models/Table');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // wipe existing data
    await User.deleteMany({});
    await Table.deleteMany({});
    console.log('Cleared users and tables');

    // create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'Admin'
    });

    // create a test customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customer123',
      role: 'Customer'
    });

    // create tables with different capacities
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
      { tableNumber: 10, capacity: 12 }
    ];
    await Table.insertMany(tables);

    console.log('\nSeeding complete!');
    console.log('---');
    console.log(`Admin:    ${admin.email} / admin123`);
    console.log(`Customer: ${customer.email} / customer123`);
    console.log(`Tables:   ${tables.length} (seats 2-12)`);
    console.log('---');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
