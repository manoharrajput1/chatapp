import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Number, required: true },
});
const Message = models.Message || model('Message', MessageSchema);
export default Message;