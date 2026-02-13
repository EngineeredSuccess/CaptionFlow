import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const waitlistSchema = z.object({
    email: z.string().email(),
    handle: z.string().min(1),
    platform: z.string().min(1),
});

// Since this is a public endpoint for non-authenticated users, 
// we use the service role key to insert into a specific table.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = waitlistSchema.parse(body);

        // Insert into waitlist table
        const { error } = await supabaseAdmin
            .from('waitlist')
            .insert([
                {
                    email: validatedData.email,
                    handle: validatedData.handle,
                    platform: validatedData.platform
                }
            ]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json(
                    { error: 'This email is already on the waitlist.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json(
            { message: 'Successfully joined the waitlist!' },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input data.', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Waitlist submission error:', error);
        return NextResponse.json(
            { error: 'Failed to join waitlist. Please try again later.' },
            { status: 500 }
        );
    }
}
