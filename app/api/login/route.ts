import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../models/database';
import ChatUser from '@/models/userModel';

export async function POST(req: NextRequest) {
  const { contact, password } = await req.json();
  if (!contact || !password) return NextResponse.json({ error: 'Contact and password required' }, { status: 400 });
  await connectDB();
  const user = await ChatUser.findOne({ contact });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  return NextResponse.json({ success: true, contact });
}