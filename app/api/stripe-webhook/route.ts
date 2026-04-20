import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { emailService } from '@/shared/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
          console.error('Missing metadata in checkout session');
          return NextResponse.json(
            { error: 'Missing metadata' },
            { status: 400 }
          );
        }

        // Update user subscription
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, subscription_tier')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          console.error('User not found:', userError);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Fetch subscription if possible to get current_period_end right away
        let current_period_end = null;
        if (session.subscription) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sub: any = await stripe.subscriptions.retrieve(session.subscription as string);
                current_period_end = new Date(sub.current_period_end * 1000).toISOString();
            } catch (err) {
                console.error('Failed to retrieve subscription during checkout:', err);
            }
        }

        // Update subscription details
        await supabase
          .from('users')
          .update({
            subscription_tier: tier.toLowerCase(),
            subscription_status: 'active',
            subscription_id: session.subscription as string,
            current_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Send welcome email for new subscribers
        if (userData.subscription_tier === 'free') {
          await emailService.sendUpgradeConfirmation(
            userData.email,
            tier.charAt(0).toUpperCase() + tier.slice(1)
          );
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          await supabase
            .from('users')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              subscription_id: null,
              current_period_end: null,
            })
            .eq('id', userId);
        }

        break;
      }

      case 'invoice.paid': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice: any = event.data.object;
        if (invoice.subscription) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const subscription: any = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const userId = subscription.metadata.userId;

            if (userId) {
              await supabase
                .from('users')
                .update({
                  subscription_status: 'active',
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userId);
            }
          } catch (err) {
            console.error('Error processing invoice.paid:', err);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription: any = event.data.object;
        const userId = subscription.metadata.userId;
        const tier = subscription.metadata.tier;

        if (userId) {
          const updates: Record<string, string> = {
            subscription_status: subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'past_due' ? 'active' : 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (tier) updates.subscription_tier = tier.toLowerCase();

          await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);
        }
        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
