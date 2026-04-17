const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Bookings');

dotenv.config();

const users = [
  { name: 'Admin User', email: 'admin@eventora.com', password: 'password123', role: 'admin' },
  { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
  { name: 'Alice Smith', email: 'alice@eventora.com', password: 'password123', role: 'user' },
  { name: 'Bob Johnson', email: 'bob@eventora.com', password: 'password123', role: 'user' },
  { name: 'Charlie Dave', email: 'charlie@eventora.com', password: 'password123', role: 'user' },
  { name: 'Diana Prince', email: 'diana@eventora.com', password: 'password123', role: 'user' },
  { name: 'Ethan Hunt', email: 'ethan@eventora.com', password: 'password123', role: 'user' },
  { name: 'Fiona Gallagher', email: 'fiona@eventora.com', password: 'password123', role: 'user' },
  { name: 'George Miller', email: 'george@eventora.com', password: 'password123', role: 'user' },
  { name: 'Hannah Montana', email: 'hannah@eventora.com', password: 'password123', role: 'user' }
];

const events = [
  {
    title: 'React & Node.js Developer Retreat',
    description: 'Full-stack web development bootcamp',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: 'Silicon Valley',
    category: 'Technology',
    totalSeats: 200,
    availableSeats: 200,
    ticketPrice: 0,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800'
  },
  {
    title: 'Neon Nights EDM Festival',
    description: 'Music festival experience',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    location: 'New York',
    category: 'Music',
    totalSeats: 500,
    availableSeats: 500,
    ticketPrice: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800'
  },
  {
    title: 'Global Business Summit',
    description: 'CEOs networking event',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    location: 'London',
    category: 'Business',
    totalSeats: 150,
    availableSeats: 150,
    ticketPrice: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800'
  },
  {
    title: 'Modern Art Expo',
    description: 'Art exhibition showcase',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Museum',
    category: 'Art',
    totalSeats: 300,
    availableSeats: 300,
    ticketPrice: 200,
    imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=800'
  },
  {
    title: 'Startup Pitch Competition',
    description: 'Startup funding event',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: 'Miami',
    category: 'Business',
    totalSeats: 250,
    availableSeats: 250,
    ticketPrice: 100,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800'
  },
  {
    title: 'Cloud Computing Seminar',
    description: 'Learn AWS & cloud architecture',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    location: 'Seattle',
    category: 'Technology',
    totalSeats: 100,
    availableSeats: 100,
    ticketPrice: 600,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventora');
    console.log('✅ MongoDB connected');

    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log('🗑️ Old data cleared');

    const salt = await bcrypt.genSalt(10);

    const hashedUsers = users.map(u => ({
      ...u,
      password: bcrypt.hashSync(u.password, salt),
      isVerified: true
    }));

    const createdUsers = await User.insertMany(hashedUsers);

    const admin = createdUsers.find(u => u.role === 'admin');
    const normalUsers = createdUsers.filter(u => u.role === 'user');

    console.log(`👤 Users created: ${createdUsers.length}`);

    const eventsWithAdmin = events.map(e => ({
      ...e,
      createdBy: admin._id
    }));

    const createdEvents = await Event.insertMany(eventsWithAdmin);

    console.log(`🎉 Events created: ${createdEvents.length}`);

    let bookings = [];

    for (const event of createdEvents) {
      const selectedUsers = [...normalUsers]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      for (const user of selectedUsers) {
        const statuses = ['pending', 'confirmed', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        let paymentStatus = 'non_paid';

        if (status === 'confirmed' && event.ticketPrice > 0) {
          paymentStatus = Math.random() > 0.3 ? 'paid' : 'non_paid';
        }

        bookings.push({
          userId: user._id,
          eventId: event._id,
          status,
          paymentStatus,
          amount: event.ticketPrice
        });

        if (status === 'confirmed') {
          event.availableSeats -= 1;
        }
      }

      await event.save();
    }

    await Booking.insertMany(bookings);

    console.log(`🎫 Bookings created: ${bookings.length}`);

    console.log('\n🚀 SEED COMPLETED SUCCESSFULLY');
    console.log('Admin: admin@eventora.com | password123');
    console.log('User: user@eventora.com | password123');

    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();