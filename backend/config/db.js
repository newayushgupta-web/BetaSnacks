const mongoose = require('mongoose');

// Prevent Mongoose from freezing requests when disconnected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries += 1;
      console.error(`MongoDB connection attempt ${retries} failed: ${error.message}`);
      if (retries >= maxRetries) {
        console.warn('⚠️ Max MongoDB retries reached. Server will remain running. Please provide a valid MONGODB_URI in backend/.env to connect to your live database.');
        return;
      }
      const delay = Math.min(1000 * 2 ** retries, 30000);
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

module.exports = connectDB;
