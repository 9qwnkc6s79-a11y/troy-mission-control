import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const EMAILS_FILE = path.join(process.cwd(), 'emails.json');

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Read existing emails
    let emails: string[] = [];
    try {
      const data = await fs.readFile(EMAILS_FILE, 'utf-8');
      emails = JSON.parse(data);
    } catch {
      // File doesn't exist yet, start with empty array
    }

    // Add if not duplicate
    if (!emails.includes(email)) {
      emails.push(email);
      await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
