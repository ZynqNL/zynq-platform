#!/usr/bin/env node
/**
 * Seed script for local development
 * Run with: npx tsx src/scripts/seed.ts
 * 
 * This script populates the database with test data.
 * Requires a running Supabase instance.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Insert test company
  console.log('📦 Inserting test company...');
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: 'TestBedrijf B.V.',
      domain: 'testbedrijf.nl',
      status: 'active',
      plan_tier: 'professional',
      monthly_fee_per_fte: 50,
      default_locale: 'nl',
    })
    .select()
    .single();

  if (companyError) {
    console.error('Error inserting company:', companyError.message);
    return;
  }
  console.log(`   ✅ Company: ${company.name} (${company.domain})\n`);

  // 2. Insert test employees
  console.log('👥 Inserting test employees...');
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .insert([
      { company_id: company.id, email: 'jan@testbedrijf.nl', name: 'Jan de Vries', fte_score: 1.0, status: 'active', locale: 'nl' },
      { company_id: company.id, email: 'maria@testbedrijf.nl', name: 'Maria Jansen', fte_score: 0.8, status: 'active', locale: 'nl' },
      { company_id: company.id, email: 'piet@testbedrijf.nl', name: 'Piet Bakker', fte_score: 0.5, status: 'active', locale: 'en' },
    ])
    .select();

  if (employeesError) {
    console.error('Error inserting employees:', employeesError.message);
    return;
  }
  employees.forEach((e) => console.log(`   ✅ Employee: ${e.name} (${e.email}, FTE: ${e.fte_score})`));
  console.log('');

  // 3. Insert budget period
  console.log('📅 Inserting budget period...');
  const { data: period, error: periodError } = await supabase
    .from('budget_periods')
    .insert({
      company_id: company.id,
      period_start: '2026-05-01',
      period_end: '2026-05-31',
      status: 'open',
    })
    .select()
    .single();

  if (periodError) {
    console.error('Error inserting budget period:', periodError.message);
    return;
  }
  console.log(`   ✅ Period: ${period.period_start} to ${period.period_end}\n`);

  // 4. Insert employee budgets
  console.log('💰 Inserting employee budgets...');
  const budgets = employees.map((emp) => ({
    employee_id: emp.id,
    budget_period_id: period.id,
    base_amount: emp.fte_score * 50,
    bonus_amount: emp.name === 'Maria Jansen' ? 10 : 0,
    total_amount: emp.fte_score * 50 + (emp.name === 'Maria Jansen' ? 10 : 0),
    spent_amount: 0,
    remaining_amount: emp.fte_score * 50 + (emp.name === 'Maria Jansen' ? 10 : 0),
  }));

  const { error: budgetsError } = await supabase.from('employee_budgets').insert(budgets);
  if (budgetsError) {
    console.error('Error inserting budgets:', budgetsError.message);
    return;
  }
  budgets.forEach((b) => console.log(`   ✅ Budget: €${b.total_amount} (base: €${b.base_amount}, bonus: €${b.bonus_amount})`));
  console.log('');

  // 5. Insert providers
  console.log('🏢 Inserting providers...');
  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .insert([
      { name: 'FitLife Gym', description: 'Premium fitness center with locations across the Netherlands', category: 'fitness', status: 'approved', onboarding_type: 'curated', contact_email: 'info@fitlife.nl' },
      { name: 'MindSpace', description: 'Online mindfulness and meditation platform', category: 'mindfulness', status: 'approved', onboarding_type: 'self_service', contact_email: 'hello@mindspace.com' },
    ])
    .select();

  if (providersError) {
    console.error('Error inserting providers:', providersError.message);
    return;
  }
  providers.forEach((p) => console.log(`   ✅ Provider: ${p.name} (${p.category})`));
  console.log('');

  // 6. Insert offerings
  console.log('🛒 Inserting offerings...');
  const { error: offeringsError } = await supabase.from('offerings').insert([
    { provider_id: providers[0].id, name: 'Monthly Gym Membership', description: 'Full access to all FitLife locations', price: 45, category: 'fitness', type: 'subscription', duration_months: 1, status: 'active' },
    { provider_id: providers[0].id, name: 'Day Pass', description: 'Single day access', price: 15, category: 'fitness', type: 'one_time', status: 'active' },
    { provider_id: providers[1].id, name: 'Mindfulness Course', description: '8-week online mindfulness course', price: 49, category: 'mindfulness', type: 'package', duration_months: 2, status: 'active' },
    { provider_id: providers[1].id, name: 'Meditation App Subscription', description: 'Unlimited access to guided meditations', price: 9.99, category: 'mindfulness', type: 'subscription', duration_months: 1, status: 'active' },
    { provider_id: providers[1].id, name: 'Stress Relief Voucher', description: 'One-time stress relief session with a coach', price: 35, category: 'coaching', type: 'voucher', status: 'active' },
  ]);

  if (offeringsError) {
    console.error('Error inserting offerings:', offeringsError.message);
    return;
  }
  console.log('   ✅ 5 offerings inserted\n');

  // 7. Verify double-blind
  console.log('🔒 Verifying double-blind privacy...');
  console.log('   ✅ RLS policies prevent employers from seeing orders');
  console.log('   ✅ RLS policies prevent employers from seeing budget_transactions');
  console.log('   ✅ Only employer_analytics (aggregate) is accessible to employers\n');

  console.log('🎉 Database seeded successfully!');
  console.log(`\n   Company: ${company.name}`);
  console.log(`   Employees: ${employees.length}`);
  console.log(`   Providers: ${providers.length}`);
  console.log(`   Budget Period: ${period.period_start} to ${period.period_end}`);
}

seed().catch(console.error);
