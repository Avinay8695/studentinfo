-- Add is_approved column to profiles table (default false for new users)
ALTER TABLE public.profiles 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Update existing users to be approved (so current users aren't locked out)
UPDATE public.profiles SET is_approved = true;

-- Update the handle_new_user function to explicitly set is_approved = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile with is_approved = false (pending approval)
  INSERT INTO public.profiles (user_id, full_name, email, is_approved)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email, false);
  
  -- Assign admin role (first user becomes admin, others are users)
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    -- First user (admin) is auto-approved
    UPDATE public.profiles SET is_approved = true WHERE user_id = NEW.id;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;