# 🍛 Nibble — Campus Food Delivery

A web app for ordering campus food, built for UNILAG students.

**Stack:** React · Supabase · Netlify

---

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/nibble-web.git
cd nibble-web
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database
- Go to **Supabase Dashboard → SQL Editor**
- Open `supabase/schema.sql`
- Paste the full contents and click **Run**
- Done — tables, RLS policies, seed data all created in one step

### 4. Run locally
```bash
npm run dev
```
Visit `http://localhost:5173`

---

## Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from GitHub**
3. Select your `nibble-web` repo
4. Build settings are auto-detected from `netlify.toml`
5. Go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**

---

## User Roles

| Role | Access | Default redirect |
|---|---|---|
| Student | Browse vendors, order food, track orders | `/student` |
| Vendor | Manage menu, process orders | `/vendor` |
| Runner | Accept and complete deliveries | `/runner` |
| Admin | Full platform oversight | `/admin` |

Register with your email and select your role on signup.

---

## Project Structure

```
src/
├── pages/
│   ├── auth/        # Login, Register, CompleteProfile
│   ├── student/     # Home, VendorDetail, Cart, Checkout, Orders
│   ├── vendor/      # Dashboard, Orders, Menu
│   ├── runner/      # Dashboard, Deliveries, Earnings
│   └── admin/       # Dashboard, Users, Vendors, Orders
├── services/        # All Supabase API calls
├── store/           # Zustand state (auth, cart)
├── components/      # Shared UI (Navbar, guards)
├── constants/       # Colours, routes, categories
├── utils/           # formatNaira, timeAgo, etc.
└── styles/          # global.css
```

---

## Payment

MVP uses **Cash on Delivery**. Runner collects cash at the door.
Paystack integration is ready to add post-verification — see `services/orders.js`.

---

## Adding a Vendor (Manual — Admin)

Until the admin vendor-creation UI is built:
1. Register a new account with role **Vendor**
2. Go to Supabase → Table Editor → `vendors`
3. Insert a row: `profile_id` = their user ID, `name`, `campus_id`
4. They can now log in and manage their menu

---

## Handoff Notes for Developer

- All Supabase calls are in `/src/services/` — easy to swap or extend
- RLS is enabled on all tables — test with different role accounts
- Real-time order tracking uses Supabase channels (`subscribeToOrder` in `services/orders.js`)
- Cart state lives in Zustand (`store/cartStore.js`) — persists in memory only, clears on refresh (intentional for MVP)
- Run `npm run build` before deploying to catch any import errors early
