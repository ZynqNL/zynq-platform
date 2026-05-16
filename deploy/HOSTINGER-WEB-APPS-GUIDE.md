# Zynq Platform — Hostinger Node.js Web Apps Deployment

## Wat je nodig hebt
- Hostinger **Node.js Web Apps** hosting (Business plan of hoger)
- GitHub repository met je code
- Domein (zynq.nl) gekoppeld aan je Hostinger account
- Supabase project (cloud)
- Stripe account (live mode)

---

## Stap 1: Code naar GitHub Pushen

```powershell
cd C:\Users\tijsh\Desktop\Zynq\zynq-platform

# Initialiseer git (als nog niet gedaan)
git init
git add .
git commit -m "Initial commit - Zynq platform"

# Maak een repository op GitHub.com
# Vervang met jouw repo URL:
git remote add origin https://github.com/jouw-username/zynq-platform.git
git branch -M main
git push -u origin main
```

**Belangrijk:** Zorg dat `.env.local` in `.gitignore` staat — **nooit secrets committen!**

---

## Stap 2: Node.js App Aanmaken in hPanel

1. Log in op **Hostinger hPanel**
2. Ga naar **Websites** → klik op je domein
3. Zoek **Node.js** of **Web Apps** in het menu
4. Klik op **Create App** of **Add Node.js App**
5. Kies **Import from Git Repository**
6. Autoriseer GitHub en selecteer `zynq-platform` repository
7. Hostinger detecteert automatisch Next.js

---

## Stap 3: Build Configuratie Instellen

In de app settings, configureer:

| Setting | Waarde |
|---|---|
| **Node.js versie** | `20` (of `22`) |
| **Install command** | `npm ci` |
| **Build command** | `npm run build` |
| **Start command** | `npm run start -- -p $PORT` |
| **Build directory** | `.` (root van repo) |
| **Output directory** | `.next` |

---

## Stap 4: Environment Variables Toevoegen

In hPanel → App Settings → **Environment Variables**, voeg toe:

```
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
CRON_SECRET=jouw-willekeurige-cron-secret
NEXT_PUBLIC_APP_URL=https://zynq.nl
NODE_ENV=production
```

⚠️ **Gebruik GEEN quotes** rond waarden in hPanel.

---

## Stap 5: Deployen

1. Klik op **Deploy** in hPanel
2. Hostinger runt automatisch:
   - `npm ci` (dependencies installeren)
   - `npm run build` (Next.js builden)
   - `npm run start -- -p $PORT` (app starten)
3. Wacht tot de build klaar is (2-5 minuten)
4. Je app is nu bereikbaar op je domein

---

## Stap 6: Domein & SSL Configureren

1. Ga in hPanel naar **Domains** → **Manage**
2. Zorg dat je domein (zynq.nl) pointing is naar Hostinger nameservers
3. SSL wordt **automatisch** geïnstalleerd door Hostinger
4. Wacht 5-15 minuten tot SSL actief is
5. Test: `https://zynq.nl/nl`

---

## Stap 7: Stripe Webhook Configureren

1. Ga naar **Stripe Dashboard** → Developers → Webhooks
2. Klik **Add endpoint**
3. Endpoint URL: `https://zynq.nl/api/stripe/webhook`
4. Selecteer events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`
5. Klik **Add endpoint**
6. Kopieer **Signing secret** (`whsec_...`)
7. Update `STRIPE_WEBHOOK_SECRET` in hPanel
8. **Re-deploy** de app

---

## Stap 8: Supabase Migratie Runnen

Optie A — Via Supabase Dashboard:
1. Ga naar **Supabase** → SQL Editor
2. Kopieer de inhoud van `supabase/migrations/001_initial_schema.sql`
3. Plak en run

Optie B — Lokaal via CLI:
```bash
cd C:\Users\tijsh\Desktop\Zynq\zynq-platform
npx supabase db push
```

---

## Stap 9: Maandelijkse Facturatie Cron

Hostinger Node.js hosting heeft **geen directe cron** toegang. Workarounds:

**Optie A — Externe cron service (aanbevolen):**
1. Gebruik [cron-job.org](https://cron-job.org) (gratis) of [EasyCron](https://www.easycron.com)
2. Maak een cron job:
   - URL: `https://zynq.nl/api/cron/monthly-billing`
   - Header: `Authorization: Bearer jouw-cron-secret`
   - Schedule: `1st of every month at 00:00`

**Optie B — GitHub Actions:**
```yaml
# .github/workflows/monthly-billing.yml
name: Monthly Billing
on:
  schedule:
    - cron: '0 0 1 * *'
jobs:
  billing:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger billing
        run: |
          curl -H 'Authorization: Bearer ${{ secrets.CRON_SECRET }}' \
            https://zynq.nl/api/cron/monthly-billing
```

---

## Stap 10: Automatische Deployments Instellen

Hostinger kan automatisch deployen bij elke push:

1. Ga naar je Node.js App in hPanel
2. Zoek **Deployment Settings** of **Git Integration**
3. Zet **Auto-deploy on push** aan
4. Kies branch: `main`
5. Nu wordt elke `git push` automatisch gedeployed

---

## Handige Acties

### Nieuwe versie deployen
```powershell
# Maak wijzigingen, commit en push
git add .
git commit -m "Beschrijving van wijziging"
git push
# Hostinger deployt automatisch (als auto-deploy aan staat)
```

### Handmatig deployen
1. Ga naar hPanel → Node.js App
2. Klik **Redeploy** of **Deploy latest**

### Logs bekijken
1. hPanel → Node.js App → **Logs**
2. Bekijk build logs en runtime logs

### App herstarten
1. hPanel → Node.js App → **Restart**

---

## Bekende Beperkingen Hostinger Node.js Hosting

| Feature | Status | Workaround |
|---|---|---|
| Server-side rendering | ✅ Werkt | Native support |
| API routes | ✅ Werkt | Native support |
| Middleware | ✅ Werkt | Native support |
| Cron jobs | ❌ Geen directe toegang | Externe cron service |
| File uploads (groot) | ⚠️ Limiet | Gebruik Supabase Storage |
| WebSocket | ⚠️ Beperkt | Polling of Supabase Realtime |
| Custom Nginx config | ❌ Niet mogelijk | Hostinger beheert dit |
| SSH toegang | ❌ Niet bij web hosting | Upgrade naar VPS indien nodig |
| PM2 | ❌ Hostinger beheert | Niet nodig |

---

## .gitignore Controleren

Zorg dat dit in je `.gitignore` staat:

```
# Environment
.env.local
.env.production
.env

# Next.js
.next/
out/
node_modules/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Build
*.tsbuildinfo
```

---

## Problemen Oplossen

### Build faalt
- Controleer of **alle** env vars zijn ingesteld in hPanel
- Run lokaal `npm run build` om errors te zien
- Check build logs in hPanel

### App start niet
- Controleer start command: `npm run start -- -p $PORT`
- `$PORT` is vereist — Hostinger assigneert een dynamische poort
- Check runtime logs in hPanel

### 502 Bad Gateway
- App is gecrasht of niet gestart
- Controleer logs in hPanel
- Probeer handmatig restarten

### Omgevingsvariabelen niet beschikbaar
- `NEXT_PUBLIC_` variabelen zijn beschikbaar in browser + server
- Non-`NEXT_PUBLIC_` variabelen zijn **alleen** server-side
- Na wijzigen van env vars: **re-deploy** vereist

### Stripe webhook faalt
- Controleer of `STRIPE_WEBHOOK_SECRET` correct is
- Webhook URL moet HTTPS zijn
- Check Stripe Dashboard → Webhooks → events voor errors
