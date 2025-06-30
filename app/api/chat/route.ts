import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/models/database';
import Message from '../../../models/messageModels';
import ChatUser from '../../../models/userModel';

export async function POST(req: NextRequest) {
  const { from, to, text } = await req.json();
  if (!from || !to || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  await connectDB();
  // Check if both users are registered
  const sender = await ChatUser.findOne({ contact: from });
  const receiver = await ChatUser.findOne({ contact: to });
  if (!sender || !receiver) {
    return NextResponse.json({ error: 'user is not registered' }, { status: 403 });
  }
  const timestamp = Date.now();
  const message = await Message.create({ from, to, text, timestamp });
  // Save chat reference to both users
  await ChatUser.updateOne(
    { contact: from },
    { $addToSet: { chats: { contact: to } } },
    { upsert: true }
  );
  await ChatUser.updateOne(
    { contact: to },
    { $addToSet: { chats: { contact: from } } },
    { upsert: true }
  );
  return NextResponse.json({ success: true, message });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!from || !to) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  await connectDB();
  const messages = await Message.find({
    $or: [{ from, to }, { from: to, to: from }]
  }).sort({ timestamp: 1 });
  return NextResponse.json({ messages });
}