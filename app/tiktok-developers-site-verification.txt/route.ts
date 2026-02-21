import { NextResponse } from 'next/server';

export async function GET() {
    return new NextResponse(
        'tiktok-developers-site-verification=3PHlOJgI5byEHPdRM8vDqzxn4nUnbLQH\n',
        {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        }
    );
}
