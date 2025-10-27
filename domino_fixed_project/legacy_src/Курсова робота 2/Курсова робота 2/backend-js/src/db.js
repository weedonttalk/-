import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/domino';
export async function connectMongo(){
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  const safe = uri.replace(/\/\/.*:.*@/, '//***:***@');
  console.log('[mongo] connected:', safe);
}
