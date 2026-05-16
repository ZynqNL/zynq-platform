import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company
    const { data: contact } = await supabase
      .from('company_contacts')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (!contact) {
      return NextResponse.json({ error: 'Not a company contact' }, { status: 403 });
    }

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', contact.company_id)
      .maybeSingle();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const body = await request.json();
    const { planTier } = body;

    const priceId = process.env[`STRIPE_PRICE_${planTier.toUpperCase()}`];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = company.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: company.name,
        metadata: {
          company_id: company.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', company.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${request.nextUrl.pathname.replace('/api/stripe/checkout', '')}/employer/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${request.nextUrl.pathname.replace('/api/stripe/checkout', '')}/employer/billing?canceled=true`,
      metadata: {
        company_id: company.id,
        plan_tier: planTier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
