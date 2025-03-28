-- Add username and avatar columns to the invitations table to store this information at invitation time
-- This ensures we have the data even if the user hasn't accepted yet or there's an issue with profiles

ALTER TABLE public.group_invitations 
ADD COLUMN IF NOT EXISTS inviter_name TEXT,
ADD COLUMN IF NOT EXISTS inviter_avatar TEXT;

-- Update the existing trigger function to handle user information better
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        -- Get the user_id for the email
        DECLARE
            invited_user_id UUID;
            invited_user_email TEXT;
        BEGIN
            -- Get the user id from auth.users
            SELECT id, email INTO invited_user_id, invited_user_email 
            FROM auth.users 
            WHERE email = NEW.email;
            
            IF invited_user_id IS NOT NULL THEN
                -- Check if they're already a member
                IF NOT EXISTS (
                    SELECT 1 FROM public.group_members 
                    WHERE group_id = NEW.group_id AND user_id = invited_user_id
                ) THEN
                    -- Add them to the group
                    INSERT INTO public.group_members (group_id, user_id)
                    VALUES (NEW.group_id, invited_user_id);
                    
                    -- Check if they already have a profile
                    IF NOT EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE id = invited_user_id
                    ) THEN
                        -- Create a basic profile for them with username based on email
                        INSERT INTO public.profiles (
                            id, 
                            username, 
                            full_name, 
                            default_currency
                        )
                        VALUES (
                            invited_user_id, 
                            split_part(invited_user_email, '@', 1), 
                            split_part(invited_user_email, '@', 1),
                            'INR'
                        );
                    END IF;
                END IF;
            END IF;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to store inviter information at invitation time
CREATE OR REPLACE FUNCTION public.store_inviter_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Get inviter's name and avatar
    DECLARE
        inviter_username TEXT;
        inviter_fullname TEXT;
        inviter_avatar TEXT;
    BEGIN
        SELECT username, full_name, avatar_url 
        INTO inviter_username, inviter_fullname, inviter_avatar
        FROM public.profiles
        WHERE id = NEW.invited_by;
        
        -- Update the invitation with inviter info
        NEW.inviter_name := COALESCE(inviter_fullname, inviter_username, 'Unknown User');
        NEW.inviter_avatar := inviter_avatar;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to capture inviter information when invitation is created
DROP TRIGGER IF EXISTS on_invitation_created ON public.group_invitations;

CREATE TRIGGER on_invitation_created
BEFORE INSERT ON public.group_invitations
FOR EACH ROW
EXECUTE FUNCTION public.store_inviter_info();

-- Run an update on all existing invitations to fix inviter names
UPDATE public.group_invitations gi
SET inviter_name = COALESCE(p.full_name, p.username, 'Unknown User')
FROM public.profiles p
WHERE gi.invited_by = p.id; 