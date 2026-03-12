# SpendWise

A personal expense tracker mobile app built with React Native (Expo) and Supabase. Designed for Sri Lankan users with full LKR currency support.

## Features

- **Authentication** - Sign up / Sign in with email & password via Supabase Auth; session persisted securely on device
- **Expense Tracking** - Log expenses with title, amount, category, date, and optional note
- **Delete Expense** - Swipe left on any expense to delete; soft-deleted in the database (recoverable)
- **Category Filtering** - Browse expenses by Food, Transport, Shopping, Health, Entertainment, Other
- **Month Navigation** - Browse expenses and analytics for any past month using the month picker
- **Monthly Summary** - See total spent vs. monthly spending limit with an animated progress bar
- **Analytics** - Weekly bar chart (Wk 1–5) + per-category breakdown with percentage shares, navigable by month
- **Spending Limits** - Set overall and per-category monthly limits; category limits are validated against the overall budget; warned at 80%, alerted when exceeded
- **Theme Support** - Light, Dark, and System (follows device) themes with smooth transitions
- **Animations** - Splash screen sequence, loading overlays, toast notifications, animated progress bars
- **Safe Area Handling** - Proper notch, Dynamic Island, and gesture bar support on all screens

## Tech Stack

- React Native + Expo (SDK 55)
- Expo Router (file-based navigation)
- Supabase (Auth + PostgreSQL with RLS)
- react-native-reanimated v3
- react-native-gesture-handler (swipe interactions)
- lucide-react-native (icons)
- @expo-google-fonts/sora (typography)
- expo-linear-gradient
- expo-secure-store (session persistence)
- react-native-safe-area-context

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd SpendWise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL from the **Database Schema** section below in the Supabase SQL editor
3. Go to **Authentication → Sign In / Providers → Email** and disable **Confirm email** so users can sign in immediately after registration
4. Copy your project URL and anon key from **Project Settings → API**

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the app

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Expo Go (scan QR code)
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |

## Database Schema

Run this SQL in the Supabase SQL editor:

```sql
-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  created_at timestamptz default now()
);

-- Expenses table
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  amount numeric(12,2) not null,
  category text not null check (category in ('Food','Transport','Shopping','Health','Entertainment','Other')),
  date date not null,
  note text default '',
  created_at timestamptz default now(),
  deleted_at timestamptz default null
);

-- Spending limits table
create table spending_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  overall numeric(12,2) default 0,
  food numeric(12,2) default 0,
  transport numeric(12,2) default 0,
  shopping numeric(12,2) default 0,
  health numeric(12,2) default 0,
  entertainment numeric(12,2) default 0,
  other numeric(12,2) default 0,
  updated_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table spending_limits enable row level security;

create policy "Users own their profile"
  on profiles for all using (auth.uid() = id);

create policy "Users own their expenses"
  on expenses for all using (auth.uid() = user_id);

create policy "Users own their limits"
  on spending_limits for all using (auth.uid() = user_id);
```

## Assumptions

- All currency is displayed in Sri Lankan Rupees (LKR)
- Monthly limits reset automatically because expenses are filtered by the selected calendar month — no data is deleted
- Deleted expenses are soft-deleted (the `deleted_at` column is set) rather than permanently removed, so data remains recoverable
- The sum of all per-category spending limits cannot exceed the overall monthly limit; this is enforced in the UI
- Email confirmation is disabled in Supabase so users can sign in immediately after registration
- "Forgot password" UI is present on the login screen but the email reset flow is not implemented in this version
