import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/models/database';
import ChatUser from '@/models/userModel';

export async function POST(req: NextRequest) {
  const { contact, password } = await req.json();
  if (!contact || !password) return NextResponse.json({ error: 'Contact and password required' }, { status: 412});
  await connectDB();
  const existing = await ChatUser.findOne({ contact });
  if (existing) return NextResponse.json({ error: 'Contact already registered' }, { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  await ChatUser.create({ contact, password: hash });
  return NextResponse.json({ success: true });
}