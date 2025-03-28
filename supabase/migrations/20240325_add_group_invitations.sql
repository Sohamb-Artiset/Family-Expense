-- Create the group_invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE (group_id, email)
);

-- Add RLS policies
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see invitations sent to their email
CREATE POLICY "Users can view their own invitations" ON public.group_invitations
    FOR SELECT USING (
        auth.jwt() IS NOT NULL
        AND (
            email = (SELECT email FROM auth.users WHERE id = auth.uid())
            OR invited_by = auth.uid()
        )
    );

-- Policy to allow group creators to create invitations
CREATE POLICY "Group creators can create invitations" ON public.group_invitations
    FOR INSERT WITH CHECK (
        auth.jwt() IS NOT NULL
        AND (
            EXISTS (
                SELECT 1 FROM public.groups 
                WHERE id = group_id 
                AND created_by = auth.uid()
            )
        )
    );

-- Policy to allow users to accept/reject their own invitations
CREATE POLICY "Users can update their own invitations" ON public.group_invitations
    FOR UPDATE USING (
        auth.jwt() IS NOT NULL
        AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) WITH CHECK (
        status IN ('accepted', 'rejected')
    );

-- Function to add user to group when invitation is accepted
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        -- Get the user_id for the email
        DECLARE
            user_id UUID;
        BEGIN
            SELECT id INTO user_id FROM auth.users WHERE email = NEW.email;
            
            IF user_id IS NOT NULL THEN
                -- Check if they're already a member
                IF NOT EXISTS (
                    SELECT 1 FROM public.group_members 
                    WHERE group_id = NEW.group_id AND user_id = user_id
                ) THEN
                    -- Add them to the group
                    INSERT INTO public.group_members (group_id, user_id)
                    VALUES (NEW.group_id, user_id);
                END IF;
            END IF;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle invitation acceptance
CREATE TRIGGER on_invitation_acceptance
AFTER UPDATE ON public.group_invitations
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
EXECUTE FUNCTION public.handle_invitation_acceptance(); 