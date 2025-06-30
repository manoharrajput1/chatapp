import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  contact: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chats: [{ contact: { type: String } }], // Add chats array
});
const ChatUser = models.ChatUser || model('ChatUser', UserSchema);
export default ChatUser;