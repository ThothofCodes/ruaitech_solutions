
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const users = await User.find({}, 'name email role isActive');
  console.log('Users in database:');
  users.forEach(user => console.log(`- ${user.name}: ${user.email} (Role: ${user.role}, Active: ${user.isActive})`));
  mongoose.disconnect();
}).catch(console.error);

