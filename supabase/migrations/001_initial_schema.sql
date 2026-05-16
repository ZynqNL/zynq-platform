-- =====================================================
-- Zynq Platform — Initial Schema
-- Migration: 001_initial_schema
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. SUPPORTED LOCALES
-- =====================================================
create table locales (
  code text primary key,
  name text not null,
  native_name text not null,
  is_active boolean default true,
  sort_order int default 0
);

insert into locales (code, name, native_name, sort_order) values
  ('nl', 'Dutch', 'Nederlands', 1),
  ('en', 'English', 'English', 2),
  ('de', 'German', 'Deutsch', 3),
  ('fr', 'French', 'Français', 4),
  ('es', 'Spanish', 'Español', 5);

-- =====================================================
-- 2. COMPANIES (Employers)
-- =====================================================
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text unique not null,
  status text not null default 'trial' check (status in ('trial', 'active', 'suspended', 'churned')),
  plan_tier text not null default 'starter' check (plan_tier in ('starter', 'professional', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  monthly_fee_per_fte numeric not null default 25.00,
  default_locale text not null default 'nl' references locales(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 3. COMPANY CONTACTS (Admin users at the company)
-- =====================================================
create table company_contacts (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  email text unique not null,
  name text,
  role text not null default 'admin' check (role in ('admin', 'hr', 'finance')),
  locale text not null default 'nl' references locales(code),
  created_at timestamptz not null default now()
);

-- =====================================================
-- 4. EMPLOYEES
-- =====================================================
create table employees (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  email text unique not null,
  name text,
  fte_score numeric not null default 1.0 check (fte_score >= 0.0 and fte_score <= 1.0),
  status text not null default 'active' check (status in ('active', 'inactive', 'departed')),
  locale text not null default 'nl' references locales(code),
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 5. BUDGET PERIODS (Monthly cycles)
-- =====================================================
create table budget_periods (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  unique(company_id, period_start)
);

-- =====================================================
-- 6. EMPLOYEE BUDGETS (Base + Bonus per period)
-- =====================================================
create table employee_budgets (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  budget_period_id uuid not null references budget_periods(id) on delete cascade,
  base_amount numeric not null default 0,
  bonus_amount numeric not null default 0,
  total_amount numeric not null default 0,
  spent_amount numeric not null default 0,
  remaining_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  unique(employee_id, budget_period_id)
);

-- =====================================================
-- 7. PROVIDERS / Partners
-- =====================================================
create table providers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text check (category in ('fitness', 'mindfulness', 'coaching', 'nutrition', 'wellness', 'other')),
  logo_url text,
  website_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  onboarding_type text not null default 'curated' check (onboarding_type in ('curated', 'self_service')),
  contact_email text,
  stripe_connect_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 8. PROVIDER TRANSLATIONS (Multi-language support)
-- =====================================================
create table provider_translations (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references providers(id) on delete cascade,
  locale text not null references locales(code),
  name text not null,
  description text,
  unique(provider_id, locale)
);

-- =====================================================
-- 9. OFFERINGS (Products/Services from providers)
-- =====================================================
create table offerings (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references providers(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  category text check (category in ('fitness', 'mindfulness', 'coaching', 'nutrition', 'wellness', 'other')),
  type text not null default 'one_time' check (type in ('subscription', 'one_time', 'voucher', 'package')),
  duration_months int,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 10. OFFERING TRANSLATIONS (Multi-language support)
-- =====================================================
create table offering_translations (
  id uuid primary key default uuid_generate_v4(),
  offering_id uuid not null references offerings(id) on delete cascade,
  locale text not null references locales(code),
  name text not null,
  description text,
  unique(offering_id, locale)
);

-- =====================================================
-- 11. ORDERS (Employee purchases)
-- DOUBLE-BLIND: Employers CANNOT access this table
-- =====================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  offering_id uuid not null references offerings(id) on delete restrict,
  amount numeric not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled', 'refunded')),
  order_date timestamptz not null default now(),
  fulfillment_date timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 12. BUDGET TRANSACTIONS (Ledger)
-- DOUBLE-BLIND: Employers CANNOT access this table
-- =====================================================
create table budget_transactions (
  id uuid primary key default uuid_generate_v4(),
  employee_budget_id uuid not null references employee_budgets(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  type text not null check (type in ('allocation', 'spend', 'bonus', 'refund', 'rollover')),
  amount numeric not null,
  description text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 13. COMPANY INVOICES
-- =====================================================
create table company_invoices (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  stripe_invoice_id text,
  period_start date not null,
  period_end date not null,
  employee_count int not null default 0,
  total_amount numeric not null default 0,
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'overdue', 'void')),
  due_date date,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 14. EMPLOYER ANALYTICS (Pre-computed aggregate data)
-- This is the ONLY spending data employers can see
-- =====================================================
create table employer_analytics (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_budget_allocated numeric not null default 0,
  total_budget_spent numeric not null default 0,
  active_employee_count int not null default 0,
  utilization_rate numeric not null default 0,
  category_counts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(company_id, period_start)
);

-- =====================================================
-- 15. ANALYTICS EVENTS (For reporting)
-- =====================================================
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  event_type text not null,
  event_data jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 16. PLATFORM SETTINGS
-- =====================================================
create table platform_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Employee lookups
create index idx_employees_company on employees(company_id);
create index idx_employees_email on employees(email);
create index idx_employees_status on employees(company_id, status);

-- Budget lookups
create index idx_employee_budgets_employee on employee_budgets(employee_id);
create index idx_employee_budgets_period on employee_budgets(budget_period_id);
create index idx_budget_periods_company on budget_periods(company_id);

-- Order lookups (employee only, not employer)
create index idx_orders_employee on orders(employee_id);
create index idx_orders_status on orders(status);
create index idx_orders_date on orders(order_date);

-- Offering lookups
create index idx_offerings_provider on offerings(provider_id);
create index idx_offerings_status on offerings(status);
create index idx_offerings_category on offerings(category);

-- Provider lookups
create index idx_providers_status on providers(status);
create index idx_providers_category on providers(category);

-- Transaction lookups
create index idx_budget_transactions_budget on budget_transactions(employee_budget_id);
create index idx_budget_transactions_order on budget_transactions(order_id);

-- Analytics lookups
create index idx_analytics_events_company on analytics_events(company_id);
create index idx_analytics_events_type on analytics_events(event_type);
create index idx_analytics_events_created on analytics_events(created_at);

-- Invoice lookups
create index idx_company_invoices_company on company_invoices(company_id);
create index idx_company_invoices_status on company_invoices(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
alter table companies enable row level security;
alter table company_contacts enable row level security;
alter table employees enable row level security;
alter table budget_periods enable row level security;
alter table employee_budgets enable row level security;
alter table providers enable row level security;
alter table provider_translations enable row level security;
alter table offerings enable row level security;
alter table offering_translations enable row level security;
alter table orders enable row level security;
alter table budget_transactions enable row level security;
alter table company_invoices enable row level security;
alter table employer_analytics enable row level security;
alter table analytics_events enable row level security;
alter table platform_settings enable row level security;
alter table locales enable row level security;

-- =====================================================
-- LOCALES: Public read
-- =====================================================
create policy "locales_public_read"
  on locales for select
  using (true);

-- =====================================================
-- COMPANIES:
-- - Employees can see their own company
-- - Employers (company_contacts) can see their own company
-- - Admin can see all
-- =====================================================
create policy "companies_select_own"
  on companies for select
  using (
    -- Admin can see all
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
    or
    -- Employee can see their company
    id in (select company_id from employees where email = (select email from auth.users where id = auth.uid()))
    or
    -- Company contact can see their company
    id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
  );

create policy "companies_update_own"
  on companies for update
  using (
    id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "companies_insert_admin"
  on companies for insert
  with check (
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
    or true -- Allow self-registration
  );

-- =====================================================
-- COMPANY CONTACTS:
-- - Company admins can manage their contacts
-- - Admin can see all
-- =====================================================
create policy "company_contacts_select_own"
  on company_contacts for select
  using (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "company_contacts_insert_own"
  on company_contacts for insert
  with check (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "company_contacts_update_own"
  on company_contacts for update
  using (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- EMPLOYEES:
-- - Employers can see their own employees (name, email, FTE, status, budget remaining)
-- - Employees can see their own record
-- - Admin can see all
-- =====================================================
create policy "employees_select_own_company"
  on employees for select
  using (
    -- Admin can see all
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
    or
    -- Employee can see themselves
    email = (select email from auth.users where id = auth.uid())
    or
    -- Company contact can see employees in their company
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
  );

create policy "employees_update_own_company"
  on employees for update
  using (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "employees_insert_own_company"
  on employees for insert
  with check (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- BUDGET PERIODS:
-- - Employers can see their own periods
-- - Admin can see all
-- =====================================================
create policy "budget_periods_select_own"
  on budget_periods for select
  using (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "budget_periods_insert_admin"
  on budget_periods for insert
  with check (
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- EMPLOYEE BUDGETS:
-- - Employees can see their own budgets
-- - Employers can see aggregate (amounts only, not what was spent on)
-- - Admin can see all
-- =====================================================
create policy "employee_budgets_select_own"
  on employee_budgets for select
  using (
    -- Admin can see all
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
    or
    -- Employee can see their own budgets
    employee_id in (select id from employees where email = (select email from auth.users where id = auth.uid()))
    or
    -- Company contact can see budgets for their employees (amounts only)
    employee_id in (select id from employees where company_id in (
      select company_id from company_contacts where email = (select email from auth.users where id = auth.uid())
    ))
  );

create policy "employee_budgets_update_admin"
  on employee_budgets for update
  using (
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- PROVIDERS:
-- - Public can see approved providers
-- - Providers can manage their own
-- - Admin can see all
-- =====================================================
create policy "providers_select_approved"
  on providers for select
  using (
    status = 'approved'
    or
    id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "providers_update_own"
  on providers for update
  using (
    contact_email = (select email from auth.users where id = auth.uid())
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "providers_insert_self"
  on providers for insert
  with check (true); -- Self-service registration

-- =====================================================
-- PROVIDER TRANSLATIONS:
-- - Public can see translations for approved providers
-- - Providers can manage their own
-- =====================================================
create policy "provider_translations_select_approved"
  on provider_translations for select
  using (
    provider_id in (select id from providers where status = 'approved')
    or
    provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "provider_translations_manage"
  on provider_translations for all
  using (
    provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- OFFERINGS:
-- - Public can see active offerings from approved providers
-- - Providers can manage their own
-- - Admin can see all
-- =====================================================
create policy "offerings_select_active"
  on offerings for select
  using (
    (status = 'active' and provider_id in (select id from providers where status = 'approved'))
    or
    provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "offerings_manage_own"
  on offerings for all
  using (
    provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- OFFERING TRANSLATIONS:
-- - Public can see translations for active offerings
-- - Providers can manage their own
-- =====================================================
create policy "offering_translations_select_active"
  on offering_translations for select
  using (
    offering_id in (select id from offerings where status = 'active' and provider_id in (select id from providers where status = 'approved'))
    or
    offering_id in (select id from offerings where provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid())))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "offering_translations_manage"
  on offering_translations for all
  using (
    offering_id in (select id from offerings where provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid())))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- ORDERS:
-- DOUBLE-BLIND ENFORCEMENT
-- - Employees can see their own orders
-- - Providers can see orders for their offerings
-- - Admin can see all (for support)
-- - EMPLOYERS CANNOT SEE ORDERS — no policy for company_contacts
-- =====================================================
create policy "orders_select_own"
  on orders for select
  using (
    -- Employee can see their own orders
    employee_id in (select id from employees where email = (select email from auth.users where id = auth.uid()))
    or
    -- Provider can see orders for their offerings
    offering_id in (select id from offerings where provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid())))
    or
    -- Admin can see all
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "orders_insert_employee"
  on orders for insert
  with check (
    employee_id in (select id from employees where email = (select email from auth.users where id = auth.uid()))
  );

create policy "orders_update_own"
  on orders for update
  using (
    employee_id in (select id from employees where email = (select email from auth.users where id = auth.uid()))
    or
    offering_id in (select id from offerings where provider_id in (select id from providers where contact_email = (select email from auth.users where id = auth.uid())))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- BUDGET TRANSACTIONS:
-- DOUBLE-BLIND ENFORCEMENT
-- - Employees can see their own transactions
-- - Admin can see all (for support)
-- - EMPLOYERS CANNOT SEE TRANSACTIONS — no policy for company_contacts
-- =====================================================
create policy "budget_transactions_select_own"
  on budget_transactions for select
  using (
    -- Employee can see their own transactions
    employee_budget_id in (
      select id from employee_budgets where employee_id in (
        select id from employees where email = (select email from auth.users where id = auth.uid())
      )
    )
    or
    -- Admin can see all
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "budget_transactions_insert_admin"
  on budget_transactions for insert
  with check (
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- COMPANY INVOICES:
-- - Employers can see their own invoices
-- - Admin can see all
-- =====================================================
create policy "company_invoices_select_own"
  on company_invoices for select
  using (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- EMPLOYER ANALYTICS:
-- - Employers can see their own aggregate analytics
-- - Admin can see all
-- =====================================================
create policy "employer_analytics_select_own"
  on employer_analytics for select
  using (
    company_id in (select company_id from company_contacts where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "employer_analytics_manage_admin"
  on employer_analytics for all
  using (
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- ANALYTICS EVENTS:
-- - Employees can see their own events
-- - Admin can see all
-- - EMPLOYERS CANNOT SEE EVENTS — no policy for company_contacts
-- =====================================================
create policy "analytics_events_select_own"
  on analytics_events for select
  using (
    employee_id in (select id from employees where email = (select email from auth.users where id = auth.uid()))
    or
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "analytics_events_insert"
  on analytics_events for insert
  with check (true);

-- =====================================================
-- PLATFORM SETTINGS:
-- - Admin only
-- =====================================================
create policy "platform_settings_admin"
  on platform_settings for all
  using (
    (select auth.uid()) in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function: Calculate budget for an employee in a period
create or replace function calculate_budget(
  p_employee_id uuid,
  p_period_start date
)
returns numeric
language plpgsql
security definer
as $$
declare
  v_fte numeric;
  v_fee numeric;
begin
  select e.fte_score, c.monthly_fee_per_fte
  into v_fte, v_fee
  from employees e
  join companies c on c.id = e.company_id
  where e.id = p_employee_id;

  return round(v_fte * v_fee, 2);
end;
$$;

-- Function: Get remaining budget
create or replace function get_remaining_budget(
  p_budget_id uuid
)
returns numeric
language plpgsql
security definer
as $$
declare
  v_total numeric;
  v_spent numeric;
begin
  select total_amount, spent_amount
  into v_total, v_spent
  from employee_budgets
  where id = p_budget_id;

  return v_total - v_spent;
end;
$$;

-- Function: Auto-create budget periods for active companies
create or replace function auto_create_budget_periods()
returns void
language plpgsql
security definer
as $$
declare
  v_company record;
  v_start date;
  v_end date;
begin
  v_start := date_trunc('month', current_date)::date;
  v_end := (date_trunc('month', current_date) + interval '1 month - 1 day')::date;

  for v_company in
    select id from companies where status = 'active'
  loop
    insert into budget_periods (company_id, period_start, period_end, status)
    values (v_company.id, v_start, v_end, 'open')
    on conflict (company_id, period_start) do nothing;
  end loop;
end;
$$;

-- Function: Get offering with locale fallback
create or replace function get_offering_locale(
  p_offering_id uuid,
  p_locale text
)
returns table (name text, description text)
language plpgsql
security definer
as $$
begin
  return query
  select
    coalesce(t.name, o.name) as name,
    coalesce(t.description, o.description) as description
  from offerings o
  left join offering_translations t on t.offering_id = o.id and t.locale = p_locale
  where o.id = p_offering_id;
end;
$$;

-- Function: Get provider with locale fallback
create or replace function get_provider_locale(
  p_provider_id uuid,
  p_locale text
)
returns table (name text, description text)
language plpgsql
security definer
as $$
begin
  return query
  select
    coalesce(t.name, p.name) as name,
    coalesce(t.description, p.description) as description
  from providers p
  left join provider_translations t on t.provider_id = p.id and t.locale = p_locale
  where p.id = p_provider_id;
end;
$$;

-- Function: Refresh employer analytics (aggregate only)
create or replace function refresh_employer_analytics(
  p_company_id uuid,
  p_period_start date,
  p_period_end date
)
returns void
language plpgsql
security definer
as $$
declare
  v_total_allocated numeric;
  v_total_spent numeric;
  v_active_count int;
  v_utilization numeric;
  v_categories jsonb;
begin
  -- Total allocated
  select coalesce(sum(total_amount), 0)
  into v_total_allocated
  from employee_budgets eb
  join budget_periods bp on bp.id = eb.budget_period_id
  where bp.company_id = p_company_id
    and bp.period_start = p_period_start;

  -- Total spent (aggregate only)
  select coalesce(sum(bt.amount), 0)
  into v_total_spent
  from budget_transactions bt
  join employee_budgets eb on eb.id = bt.employee_budget_id
  join employees e on e.id = eb.employee_id
  where e.company_id = p_company_id
    and bt.type = 'spend'
    and bt.created_at >= p_period_start
    and bt.created_at <= p_period_end;

  -- Active employee count
  select count(distinct e.id)
  into v_active_count
  from employees e
  join employee_budgets eb on eb.employee_id = e.id
  join budget_periods bp on bp.id = eb.budget_period_id
  where e.company_id = p_company_id
    and bp.period_start = p_period_start
    and eb.spent_amount > 0;

  -- Utilization rate
  if v_total_allocated > 0 then
    v_utilization := round(v_total_spent / v_total_allocated * 100, 2);
  else
    v_utilization := 0;
  end if;

  -- Category breakdown (aggregate only)
  select coalesce(jsonb_object_agg(category, cnt), '{}'::jsonb)
  into v_categories
  from (
    select o.category, count(*) as cnt
    from orders ord
    join offerings o on o.id = ord.offering_id
    join employees e on e.id = ord.employee_id
    where e.company_id = p_company_id
      and ord.order_date >= p_period_start
      and ord.order_date <= p_period_end
      and ord.status = 'confirmed'
    group by o.category
  ) sub;

  -- Insert or update
  insert into employer_analytics (
    company_id, period_start, period_end,
    total_budget_allocated, total_budget_spent,
    active_employee_count, utilization_rate, category_counts
  )
  values (
    p_company_id, p_period_start, p_period_end,
    v_total_allocated, v_total_spent,
    v_active_count, v_utilization, v_categories
  )
  on conflict (company_id, period_start)
  do update set
    total_budget_allocated = excluded.total_budget_allocated,
    total_budget_spent = excluded.total_budget_spent,
    active_employee_count = excluded.active_employee_count,
    utilization_rate = excluded.utilization_rate,
    category_counts = excluded.category_counts,
    created_at = now();
end;
$$;

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_companies_updated_at
  before update on companies
  for each row execute function update_updated_at_column();

create trigger update_providers_updated_at
  before update on providers
  for each row execute function update_updated_at_column();

create trigger update_offerings_updated_at
  before update on offerings
  for each row execute function update_updated_at_column();

create trigger update_platform_settings_updated_at
  before update on platform_settings
  for each row execute function update_updated_at_column();

-- =====================================================
-- FUNCTION: Atomic purchase with concurrent protection
-- =====================================================
create or replace function process_purchase(
  p_employee_id uuid,
  p_offering_id uuid,
  p_amount numeric,
  p_offering_name text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_budget_id uuid;
  v_order_id uuid;
  v_remaining numeric;
begin
  -- Get current budget with row-level lock to prevent race conditions
  select eb.id, eb.remaining_amount
  into v_budget_id, v_remaining
  from employee_budgets eb
  where eb.employee_id = p_employee_id
  for update;

  if v_budget_id is null then
    return jsonb_build_object('success', false, 'error', 'No active budget');
  end if;

  -- Check sufficient budget
  if v_remaining < p_amount then
    return jsonb_build_object('success', false, 'error', 'Insufficient budget');
  end if;

  -- Create order
  insert into orders (employee_id, offering_id, amount, status)
  values (p_employee_id, p_offering_id, p_amount, 'confirmed')
  returning id into v_order_id;

  -- Create budget transaction
  insert into budget_transactions (employee_budget_id, order_id, type, amount, description)
  values (v_budget_id, v_order_id, 'spend', p_amount, p_offering_name);

  -- Update budget atomically
  update employee_budgets
  set spent_amount = spent_amount + p_amount,
      remaining_amount = remaining_amount - p_amount
  where id = v_budget_id;

  return jsonb_build_object('success', true, 'order_id', v_order_id);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Test company
insert into companies (id, name, domain, status, plan_tier, monthly_fee_per_fte, default_locale)
values
  ('00000000-0000-0000-0000-000000000001', 'TestBedrijf B.V.', 'testbedrijf.nl', 'active', 'professional', 50.00, 'nl');

-- Test employees
insert into employees (id, company_id, email, name, fte_score, status, locale)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'jan@testbedrijf.nl', 'Jan de Vries', 1.0, 'active', 'nl'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'maria@testbedrijf.nl', 'Maria Jansen', 0.8, 'active', 'nl'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'piet@testbedrijf.nl', 'Piet Bakker', 0.5, 'active', 'en');

-- Test budget period
insert into budget_periods (id, company_id, period_start, period_end, status)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '2026-05-01', '2026-05-31', 'open');

-- Test employee budgets (base = FTE * 50)
insert into employee_budgets (employee_id, budget_period_id, base_amount, bonus_amount, total_amount, spent_amount, remaining_amount)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 50.00, 0, 50.00, 0, 50.00),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000201', 40.00, 10, 50.00, 0, 50.00),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000201', 25.00, 0, 25.00, 0, 25.00);

-- Test providers
insert into providers (id, name, description, category, status, onboarding_type, contact_email)
values
  ('00000000-0000-0000-0000-000000000301', 'FitLife Gym', 'Premium fitness center with locations across the Netherlands', 'fitness', 'approved', 'curated', 'info@fitlife.nl'),
  ('00000000-0000-0000-0000-000000000302', 'MindSpace', 'Online mindfulness and meditation platform', 'mindfulness', 'approved', 'self_service', 'hello@mindspace.com');

-- Provider translations
insert into provider_translations (provider_id, locale, name, description)
values
  ('00000000-0000-0000-0000-000000000301', 'nl', 'FitLife Sportschool', 'Premium sportschool met vestigingen door heel Nederland'),
  ('00000000-0000-0000-0000-000000000302', 'nl', 'MindSpace', 'Online mindfulness en meditatie platform');

-- Test offerings
insert into offerings (id, provider_id, name, description, price, category, type, duration_months, status)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', 'Monthly Gym Membership', 'Full access to all FitLife locations', 45.00, 'fitness', 'subscription', 1, 'active'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000301', 'Day Pass', 'Single day access', 15.00, 'fitness', 'one_time', null, 'active'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000302', 'Mindfulness Course', '8-week online mindfulness course', 49.00, 'mindfulness', 'package', 2, 'active'),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000302', 'Meditation App Subscription', 'Unlimited access to guided meditations', 9.99, 'mindfulness', 'subscription', 1, 'active'),
  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000302', 'Stress Relief Voucher', 'One-time stress relief session with a coach', 35.00, 'coaching', 'voucher', null, 'active');

-- Offering translations
insert into offering_translations (offering_id, locale, name, description)
values
  ('00000000-0000-0000-0000-000000000401', 'nl', 'Maandelijks Abonnement', 'Volledige toegang tot alle FitLife vestigingen'),
  ('00000000-0000-0000-0000-000000000402', 'nl', 'Dagpas', 'Enkele dag toegang'),
  ('00000000-0000-0000-0000-000000000403', 'nl', 'Mindfulness Cursus', '8-week online mindfulness cursus'),
  ('00000000-0000-0000-0000-000000000404', 'nl', 'Meditatie App Abonnement', 'Onbeperkt toegang tot geleide meditaties'),
  ('00000000-0000-0000-0000-000000000405', 'nl', 'Stress Verlichting Voucher', 'Eenmalige stress verlichting sessie met een coach');

-- Platform settings
insert into platform_settings (key, value)
values
  ('default_monthly_fee', '25.00'),
  ('supported_categories', '["fitness", "mindfulness", "coaching", "nutrition", "wellness"]'),
  ('budget_rollover_enabled', 'false'),
  ('platform_version', '1.0.0');
