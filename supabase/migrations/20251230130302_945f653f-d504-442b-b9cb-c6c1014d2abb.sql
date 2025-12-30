-- Add sponsor_id to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE SET NULL;

-- Add index for sponsor queries
CREATE INDEX IF NOT EXISTS idx_properties_sponsor_id ON public.properties(sponsor_id);

-- Create function to sync active deals to properties
CREATE OR REPLACE FUNCTION public.sync_deal_to_property()
RETURNS TRIGGER AS $$
DECLARE
  existing_property_id UUID;
  new_property_id UUID;
  sponsor_info RECORD;
BEGIN
  -- Only process when deal becomes 'active'
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    -- Get sponsor info
    SELECT company_name, company_logo_url INTO sponsor_info
    FROM sponsor_profiles
    WHERE id = NEW.sponsor_id;
    
    -- Check if a property already exists for this deal
    SELECT id INTO existing_property_id
    FROM properties
    WHERE name = NEW.property_name 
      AND city = NEW.city
      AND sponsor_id = NEW.sponsor_id;
    
    IF existing_property_id IS NULL THEN
      -- Create new property from deal
      INSERT INTO properties (
        name,
        address,
        city,
        state,
        value,
        apy,
        token_price,
        total_tokens,
        holders,
        occupancy,
        units,
        year_built,
        category,
        description,
        image_url,
        is_hot,
        sponsor_id
      ) VALUES (
        NEW.property_name,
        COALESCE(NEW.street_address, ''),
        COALESCE(NEW.city, ''),
        COALESCE(NEW.state, ''),
        COALESCE(NEW.raise_goal, 0),
        COALESCE(NEW.preferred_return, 8),
        COALESCE(NEW.token_price, 100),
        COALESCE(NEW.total_tokens, FLOOR(NEW.raise_goal / NULLIF(NEW.token_price, 0))::int),
        0,
        COALESCE(NEW.current_occupancy, 95),
        COALESCE(NEW.total_units, 0),
        NEW.year_built,
        COALESCE(NEW.property_type, 'Multifamily'),
        NEW.property_description,
        CASE WHEN NEW.property_images IS NOT NULL AND jsonb_array_length(NEW.property_images::jsonb) > 0 
             THEN NEW.property_images::jsonb->>0 
             ELSE NULL END,
        true,
        NEW.sponsor_id
      )
      RETURNING id INTO new_property_id;
      
      -- Update the deal with the property_id reference (if column exists)
      -- This allows bidirectional linking
    END IF;
  END IF;
  
  -- Handle status changes that affect properties
  IF NEW.status IN ('closed', 'cancelled') AND OLD.status = 'active' THEN
    -- Optionally mark properties as inactive or update
    UPDATE properties
    SET is_hot = false
    WHERE sponsor_id = NEW.sponsor_id 
      AND name = NEW.property_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for deal status changes
DROP TRIGGER IF EXISTS trigger_sync_deal_to_property ON public.sponsor_deals;
CREATE TRIGGER trigger_sync_deal_to_property
  AFTER INSERT OR UPDATE OF status ON public.sponsor_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_deal_to_property();

-- Add property_id column to sponsor_deals for bidirectional linking
ALTER TABLE public.sponsor_deals
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_sponsor_deals_property_id ON public.sponsor_deals(property_id);

-- Update existing active deals to sync their properties (if any)
-- This is a one-time migration helper
DO $$
DECLARE
  deal RECORD;
  prop_id UUID;
BEGIN
  FOR deal IN 
    SELECT sd.*, sp.company_name, sp.company_logo_url 
    FROM sponsor_deals sd
    JOIN sponsor_profiles sp ON sd.sponsor_id = sp.id
    WHERE sd.status = 'active'
  LOOP
    -- Check if property exists
    SELECT id INTO prop_id
    FROM properties
    WHERE name = deal.property_name 
      AND sponsor_id = deal.sponsor_id;
    
    IF prop_id IS NULL THEN
      INSERT INTO properties (
        name, address, city, state, value, apy, token_price,
        total_tokens, holders, occupancy, units, year_built,
        category, description, is_hot, sponsor_id
      ) VALUES (
        deal.property_name,
        COALESCE(deal.street_address, ''),
        COALESCE(deal.city, ''),
        COALESCE(deal.state, ''),
        COALESCE(deal.raise_goal, 0),
        COALESCE(deal.preferred_return, 8),
        COALESCE(deal.token_price, 100),
        COALESCE(deal.total_tokens, 0),
        0,
        COALESCE(deal.current_occupancy, 95),
        COALESCE(deal.total_units, 0),
        deal.year_built,
        COALESCE(deal.property_type, 'Multifamily'),
        deal.property_description,
        true,
        deal.sponsor_id
      )
      RETURNING id INTO prop_id;
    ELSE
      -- Update existing property with sponsor_id if not set
      UPDATE properties SET sponsor_id = deal.sponsor_id WHERE id = prop_id AND sponsor_id IS NULL;
    END IF;
    
    -- Link deal to property
    UPDATE sponsor_deals SET property_id = prop_id WHERE id = deal.id;
  END LOOP;
END $$;