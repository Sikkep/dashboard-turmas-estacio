import { NextResponse } from 'next/server';
import data from '@/data/dashboard.json';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: data,
  });
}
