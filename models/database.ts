import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb+srv://newuser:singhms@cluster0.iiaul.mongodb.net/webdev?retryWrites=true&w=majority&appName=Cluster0';
let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(uri);
  isConnected = true;
}
export default mongoose;