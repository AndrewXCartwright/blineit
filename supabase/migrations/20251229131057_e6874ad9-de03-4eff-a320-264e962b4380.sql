-- =============================================
-- 1. CREATE USER ROLES TABLE FIRST
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. MESSAGING SYSTEM - TABLES ALREADY CREATED, ADD REMAINING ITEMS
-- =============================================

-- Update the create_default_property_groups function to handle missing admin gracefully
CREATE OR REPLACE FUNCTION public.create_default_property_groups()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_system_user UUID;
BEGIN
  -- Use the first admin, or skip if none exists
  SELECT user_id INTO v_system_user FROM user_roles WHERE role = 'admin' LIMIT 1;
  
  -- If no admin found, use a placeholder approach - the first holder will become creator
  IF v_system_user IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Create owners group
  INSERT INTO message_groups (name, description, type, property_id, created_by)
  VALUES (
    NEW.name || ' - Owners',
    'Discussion group for owners of ' || NEW.name,
    'property_owners',
    NEW.id,
    v_system_user
  )
  ON CONFLICT DO NOTHING;
  
  -- Create management group (private)
  INSERT INTO message_groups (name, description, type, property_id, created_by, is_private)
  VALUES (
    NEW.name || ' - Management',
    'Private management group for ' || NEW.name,
    'management',
    NEW.id,
    v_system_user,
    true
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- =============================================
-- 3. SEED DATA: Create groups for existing properties (without requiring admin)
-- =============================================
DO $$
DECLARE
  v_property RECORD;
  v_holding RECORD;
  v_group_id UUID;
  v_first_holder_id UUID;
BEGIN
  -- Loop through all properties
  FOR v_property IN SELECT id, name FROM properties LOOP
    -- Find first holder to be the group creator
    SELECT user_id INTO v_first_holder_id 
    FROM user_holdings 
    WHERE property_id = v_property.id AND tokens > 0 
    LIMIT 1;
    
    -- Skip if no holders
    IF v_first_holder_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Check if owners group already exists
    SELECT id INTO v_group_id
    FROM message_groups
    WHERE property_id = v_property.id AND type = 'property_owners';
    
    -- Create group if it doesn't exist
    IF v_group_id IS NULL THEN
      INSERT INTO message_groups (name, description, type, property_id, created_by)
      VALUES (
        v_property.name || ' - Owners',
        'Discussion group for owners of ' || v_property.name,
        'property_owners',
        v_property.id,
        v_first_holder_id
      )
      RETURNING id INTO v_group_id;
    END IF;
    
    -- Add all current holders to the group
    FOR v_holding IN SELECT user_id FROM user_holdings WHERE property_id = v_property.id AND tokens > 0 LOOP
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (v_group_id, v_holding.user_id, 'member')
      ON CONFLICT (group_id, user_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- =============================================
-- 4. SEED DATA: Create groups for existing loans
-- =============================================
DO $$
DECLARE
  v_loan RECORD;
  v_investment RECORD;
  v_group_id UUID;
  v_first_investor_id UUID;
BEGIN
  -- Loop through all loans
  FOR v_loan IN SELECT id, name FROM loans LOOP
    -- Find first investor to be the group creator
    SELECT user_id INTO v_first_investor_id 
    FROM user_loan_investments 
    WHERE loan_id = v_loan.id 
    LIMIT 1;
    
    -- Skip if no investors
    IF v_first_investor_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Check if lenders group already exists
    SELECT id INTO v_group_id
    FROM message_groups
    WHERE loan_id = v_loan.id AND type = 'loan_lenders';
    
    -- Create group if it doesn't exist
    IF v_group_id IS NULL THEN
      INSERT INTO message_groups (name, description, type, loan_id, created_by)
      VALUES (
        v_loan.name || ' - Lenders',
        'Discussion group for lenders of ' || v_loan.name,
        'loan_lenders',
        v_loan.id,
        v_first_investor_id
      )
      RETURNING id INTO v_group_id;
    END IF;
    
    -- Add all current investors to the group
    FOR v_investment IN SELECT user_id FROM user_loan_investments WHERE loan_id = v_loan.id LOOP
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (v_group_id, v_investment.user_id, 'member')
      ON CONFLICT (group_id, user_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;