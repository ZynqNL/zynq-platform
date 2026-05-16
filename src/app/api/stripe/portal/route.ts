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

    if (!company || !company.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${request.nextUrl.pathname.replace('/api/stripe/portal', '')}/employer/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
