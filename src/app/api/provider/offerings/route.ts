import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_CATEGORIES = ['fitness', 'mindfulness', 'coaching', 'nutrition', 'wellness', 'other'];
const VALID_TYPES = ['subscription', 'one_time', 'voucher', 'package'];
const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 2000;
const MAX_PRICE = 100000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('contact_email', user.email)
    .eq('status', 'approved')
    .maybeSingle();

  const prov = provider as Record<string, unknown> | null;
  if (!prov) {
    return NextResponse.json({ error: 'Not an approved provider' }, { status: 403 });
  }

  const body = await request.json();

  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const price = parseFloat(body.price);
  const category = String(body.category ?? '').trim().toLowerCase();
  const type = String(body.type ?? '').trim().toLowerCase();
  const durationMonths = body.duration_months ? parseInt(body.duration_months, 10) : null;
  const imageUrl = body.image_url ? String(body.image_url).trim() : null;

  if (!name || !description || isNaN(price) || !category || !type) {
    return NextResponse.json(
      { error: 'Alle verplichte velden moeten worden ingevuld' },
      { status: 400 }
    );
  }

  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: 'Naam is te lang' }, { status: 400 });
  }

  if (description.length > MAX_DESC_LENGTH) {
    return NextResponse.json({ error: 'Beschrijving is te lang' }, { status: 400 });
  }

  if (price <= 0 || price > MAX_PRICE) {
    return NextResponse.json({ error: 'Ongeldige prijs' }, { status: 400 });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Ongeldige categorie' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 });
  }

  if (durationMonths !== null && (isNaN(durationMonths) || durationMonths <= 0 || durationMonths > 120)) {
    return NextResponse.json({ error: 'Ongeldige duur' }, { status: 400 });
  }

  const { data: offering, error } = await supabase
    .from('offerings')
    .insert({
      provider_id: prov.id,
      name,
      description,
      price,
      category,
      type,
      duration_months: durationMonths,
      image_url: imageUrl,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Offering creation error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken' },
      { status: 500 }
    );
  }

  return NextResponse.json({ offering_id: offering.id });
}
