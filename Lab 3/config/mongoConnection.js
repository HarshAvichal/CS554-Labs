import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
let db = null;

export const connectDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db('lab3');
    console.log('Connected to MongoDB');
  }
  return db;
};
