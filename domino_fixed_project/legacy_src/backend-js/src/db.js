import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb+srv://w:www@dom.vmsf7h2.mongodb.net/';
export async function connectMongo(){
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  const safe = uri.replace(/\/\/.*:.*@/, '//***:***@');
  console.log('[mongo] connected:', safe);
}
