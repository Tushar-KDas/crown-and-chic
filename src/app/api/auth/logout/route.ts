import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('cnc_user_id');
  response.cookies.delete('cnc_user_role');
  return response;
}
