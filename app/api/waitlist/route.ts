import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const waitlistSchema = z.object({
    email: z.string().email(),
    handle: z.string().min(1),
    platform: z.string().min(1),
});

// Public anon client — RLS policy "allow_public_waitlist_insert" handles insert permission.
// Run in Supabase SQL Editor:
//   CREATE POLICY "allow_public_waitlist_insert" ON waitlist FOR INSERT TO anon WITH CHECK (true);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = waitlistSchema.parse(body);

        // Insert into waitlist table
        const { error } = await supabase
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
