import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const VALID_CATEGORIES = ['fitness', 'mindfulness', 'coaching', 'nutrition', 'wellness', 'other'];
const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 2000;
const MAX_URL_LENGTH = 500;

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const name = String(body.name ?? '').trim();
    const description = String(body.description ?? '').trim();
    const category = String(body.category ?? '').trim().toLowerCase();
    const contactEmail = String(body.contactEmail ?? '').trim().toLowerCase();
    const websiteUrl = body.websiteUrl ? String(body.websiteUrl).trim() : null;

    if (!name || !description || !category || !contactEmail) {
      return NextResponse.json(
        { error: 'Alle verplichte velden moeten worden ingevuld' },
        { status: 400 }
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: 'Naam is te lang' },
        { status: 400 }
      );
    }

    if (description.length > MAX_DESC_LENGTH) {
      return NextResponse.json(
        { error: 'Beschrijving is te lang' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Ongeldige categorie' },
        { status: 400 }
      );
    }

    if (websiteUrl && websiteUrl.length > MAX_URL_LENGTH) {
      return NextResponse.json(
        { error: 'Website URL is te lang' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Check if provider already exists with this email
    const { data: existing } = await supabase
      .from('providers')
      .select('id')
      .eq('contact_email', contactEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Er is al een aanvraag met dit e-mailadres' },
        { status: 409 }
      );
    }

    const { data: provider, error } = await supabase
      .from('providers')
      .insert({
        name,
        description,
        category,
        contact_email: contactEmail,
        website_url: websiteUrl || null,
        status: 'pending',
        onboarding_type: 'self_service',
      })
      .select()
      .single();

    if (error) {
      console.error('Provider registration error:', error);
      return NextResponse.json(
        { error: 'Er ging iets mis bij het aanmelden' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Aanvraag succesvol ingediend',
      provider_id: provider.id,
    });
  } catch {
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    );
  }
}
