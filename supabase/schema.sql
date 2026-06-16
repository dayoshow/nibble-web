-- =============================================
-- NIBBLE — SUPABASE DATABASE SCHEMA
-- University of Lagos (UNILAG) Pilot
-- =============================================
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- That's it. Your database is ready.
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('student', 'vendor', 'runner', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE order_status AS ENUM (
  'received',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'on_the_way',
  'delivered',
  'cancelled'
);
CREATE TYPE payment_method AS ENUM ('cash', 'paystack');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE product_category AS ENUM ('meals', 'snacks', 'drinks', 'essentials');
CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'suspended');

-- =============================================
-- CAMPUSES
-- =============================================

CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  state VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HOSTELS
-- =============================================

CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'mixed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PROFILES (extends Supabase auth.users)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  campus_id UUID REFERENCES campuses(id),
  hostel_id UUID REFERENCES hostels(id),
  room_number VARCHAR(20),
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- VENDORS
-- =============================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  logo_url TEXT,
  is_open BOOLEAN DEFAULT true,
  status vendor_status NOT NULL DEFAULT 'active',
  campus_id UUID REFERENCES campuses(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PRODUCTS
-- =============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category product_category NOT NULL,
  image_url TEXT,
  price NUMERIC(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ORDERS
-- =============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  runner_id UUID REFERENCES profiles(id),
  hostel_id UUID NOT NULL REFERENCES hostels(id),
  room_number VARCHAR(20) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  subtotal NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'received',
  payment_method payment_method NOT NULL DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ORDER ITEMS
-- =============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PAYMENTS
-- =============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount NUMERIC(10, 2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  paystack_reference VARCHAR(100) UNIQUE,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RUNNER EARNINGS
-- =============================================

CREATE TABLE runner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_campus ON profiles(campus_id);
CREATE INDEX idx_vendors_campus ON vendors(campus_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_student ON orders(student_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_runner ON orders(runner_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE runner_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;

-- Campuses & hostels: anyone authenticated can read
CREATE POLICY "Campuses are public" ON campuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hostels are public" ON hostels FOR SELECT TO authenticated USING (true);

-- Profiles: users manage their own profile, admins see all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Vendors: public read, vendors manage own
CREATE POLICY "Vendors are publicly readable" ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vendors can update own record" ON vendors FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());

-- Products: public read, vendors manage own
CREATE POLICY "Products are publicly readable" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vendors can manage own products" ON products FOR ALL TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()));

-- Orders: students see own, vendors see their orders, runners see assigned
CREATE POLICY "Students see own orders" ON orders FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Students can create orders" ON orders FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Vendors see their orders" ON orders FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()));
CREATE POLICY "Runners see assigned orders" ON orders FOR SELECT TO authenticated
  USING (runner_id = auth.uid());
CREATE POLICY "Vendors and runners can update order status" ON orders FOR UPDATE TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    OR runner_id = auth.uid()
  );

-- Order items: follow order visibility
CREATE POLICY "Order items visible with order" ON order_items FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE student_id = auth.uid()
    OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    OR runner_id = auth.uid()));
CREATE POLICY "Students can insert order items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Payments: students see own
CREATE POLICY "Students see own payments" ON payments FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE student_id = auth.uid()));
CREATE POLICY "Payments can be inserted" ON payments FOR INSERT TO authenticated WITH CHECK (true);

-- Runner earnings: runners see own
CREATE POLICY "Runners see own earnings" ON runner_earnings FOR SELECT TO authenticated
  USING (runner_id = auth.uid());

-- =============================================
-- TRIGGER: auto-update updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_vendors
  BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED DATA — UNILAG PILOT
-- =============================================

-- Campus
INSERT INTO campuses (id, name, state) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'University of Lagos', 'Lagos');

-- Hostels (real UNILAG hostels)
INSERT INTO hostels (campus_id, name, gender) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Fabian Okunnu Hall', 'male'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Moremi Hall', 'female'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Jaja Hall', 'male'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Amina Hall', 'female'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Sultan Bello Hall', 'male'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Biobaku Hall', 'mixed'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Angola Hall', 'male'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Nithya Hall', 'female'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Mabogunje Hall', 'mixed'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'New Hall', 'mixed');
