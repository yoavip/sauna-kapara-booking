-- Add display_name column to users table
ALTER TABLE public.users ADD COLUMN display_name text;

-- Function to update display names when first names conflict
CREATE OR REPLACE FUNCTION public.update_display_names()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflicting_user RECORD;
BEGIN
  -- Set initial display_name for the new user
  NEW.display_name := NEW.name;
  
  -- Check if there are other users with the same first name
  FOR conflicting_user IN 
    SELECT id, name, last_name, display_name 
    FROM public.users 
    WHERE name = NEW.name AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  LOOP
    -- If there's a conflict, update the new user's display_name
    IF NEW.last_name IS NOT NULL AND NEW.last_name != '' THEN
      NEW.display_name := NEW.name || ' ' || LEFT(NEW.last_name, 1);
    END IF;
    
    -- Update the existing conflicting user's display_name
    IF conflicting_user.last_name IS NOT NULL AND conflicting_user.last_name != '' THEN
      UPDATE public.users 
      SET display_name = conflicting_user.name || ' ' || LEFT(conflicting_user.last_name, 1)
      WHERE id = conflicting_user.id 
        AND (display_name IS NULL OR display_name = conflicting_user.name);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to run before insert or update on users
CREATE TRIGGER trigger_update_display_names
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_display_names();

-- Also handle updates to name or last_name
CREATE OR REPLACE FUNCTION public.recalculate_display_name_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_conflict boolean;
BEGIN
  -- Check if name or last_name changed
  IF OLD.name != NEW.name OR COALESCE(OLD.last_name, '') != COALESCE(NEW.last_name, '') THEN
    -- Check for conflicts with new name
    SELECT EXISTS (
      SELECT 1 FROM public.users 
      WHERE name = NEW.name AND id != NEW.id
    ) INTO has_conflict;
    
    IF has_conflict AND NEW.last_name IS NOT NULL AND NEW.last_name != '' THEN
      NEW.display_name := NEW.name || ' ' || LEFT(NEW.last_name, 1);
    ELSE
      NEW.display_name := NEW.name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_recalculate_display_name
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_display_name_on_update();

-- Initialize display_name for existing users
UPDATE public.users u
SET display_name = CASE
  WHEN (SELECT COUNT(*) FROM public.users u2 WHERE u2.name = u.name) > 1 
       AND u.last_name IS NOT NULL AND u.last_name != ''
  THEN u.name || ' ' || LEFT(u.last_name, 1)
  ELSE u.name
END;