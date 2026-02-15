const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Please create a .env file with MONGO_URI.');
    throw new Error('Missing MONGO_URI');
  }
  await mongoose.connect(uri);
  console.log('MongoDB Connected');
};

module.exports = connectDB;
