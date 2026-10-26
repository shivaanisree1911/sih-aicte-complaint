import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicte_complaints';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    logger.info(`MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error (${uri}):`, err.message);
    throw err;
  }
}
