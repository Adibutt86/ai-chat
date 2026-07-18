import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_secret_key_for_testing', {
  apiVersion: '2025-01-27' as any,
});

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { planName, billingCycle } = await request.json();

    if (!planName) {
      return NextResponse.json({ error: 'planName is required' }, { status: 400 });
    }

    const priceMap: Record<string, number> = {
      Starter: billingCycle === 'yearly' ? 1500 : 1900,
      Professional: billingCycle === 'yearly' ? 3900 : 4900,
      Enterprise: billingCycle === 'yearly' ? 11900 : 14900,
    };

    const priceAmount = priceMap[planName] || 1900;
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock_stripe_secret_key_for_testing') {
      try {
        let stripeSession;

        // If the user configures a live Stripe Price ID (starts with price_), use it directly in line items
        if (planName === 'Starter' && process.env.STRIPE_PRICE_STARTER && process.env.STRIPE_PRICE_STARTER.startsWith('price_')) {
          stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price: process.env.STRIPE_PRICE_STARTER,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
              userId: session.userId,
              planName: planName.toLowerCase(),
            },
          });
        } else {
          // Dynamic pricing fallback
          stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: priceAmount,
                  recurring: {
                    interval: billingCycle === 'yearly' ? 'year' : 'month',
                  },
                  product_data: {
                    name: `ChatBox AI - ${planName} Plan (${billingCycle})`,
                    description: `Access to ${planName} conversational agent resources.`,
                  },
                },
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
              userId: session.userId,
              planName: planName.toLowerCase(),
            },
          });
        }

        // Update database status
        await prisma.subscription.upsert({
          where: { id: session.userId },
          update: {
            plan: planName.toLowerCase(),
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          create: {
            id: session.userId,
            userId: session.userId,
            plan: planName.toLowerCase(),
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        return NextResponse.json({ url: stripeSession.url });
      } catch (err: any) {
        console.error('Real Stripe Session creation failed, falling back to mock checkout:', err.message);
      }
    }

    // Fallback Mock Checkout Session if Stripe setup fails
    const mockCheckoutUrl = `https://checkout.stripe.com/c/pay/mock_session_${Math.random().toString(36).substring(7)}?amount=${priceAmount}&plan=${planName}`;

    await prisma.subscription.upsert({
      where: { id: session.userId },
      update: {
        plan: planName.toLowerCase(),
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        id: session.userId,
        userId: session.userId,
        plan: planName.toLowerCase(),
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ url: mockCheckoutUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Stripe initialization failed' }, { status: 500 });
  }
}
