import React, { useState, useEffect, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseContext } from "@/contexts/ExpenseContext";
import { Plus, X } from "lucide-react";

interface AddGroupMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

const AddGroupMembersModal: React.FC<AddGroupMembersModalProps> = ({
  open,
  onOpenChange,
  groupId,
}) => {
  const { currentGroup, user } = useContext(ExpenseContext);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [existingMembers, setExistingMembers] = useState<string[]>([]);

  useEffect(() => {
    if (open && groupId) {
      // Reset state when modal opens
      setEmails([]);
      setNewEmail("");
      setEmailError("");
      fetchExistingMembers();
    }
  }, [open, groupId]);

  const fetchExistingMembers = async () => {
    try {
      // Fetch existing group invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('group_invitations')
        .select('email')
        .eq('group_id', groupId);
        
      if (invitationsError) throw invitationsError;
      
      // Get invitation emails only
      const invitationEmails = invitations.map(inv => inv.email.toLowerCase());
      
      // Set existing members as just the invitation emails
      // This will ensure we don't invite people who are already invited
      setExistingMembers(invitationEmails);
    } catch (error) {
      console.error("Error fetching existing members:", error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    
    // Validate email format
    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    // Check if email already in list
    if (emails.includes(trimmedEmail)) {
      setEmailError("This email has already been added");
      return;
    }
    
    // Check if email is already a member or has been invited
    if (existingMembers.includes(trimmedEmail)) {
      setEmailError("This person is already a member or has been invited");
      return;
    }
    
    // Add email to list
    setEmails([...emails, trimmedEmail]);
    setNewEmail("");
    setEmailError("");
  };
  
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emails.length === 0) {
      toast({
        title: "No Emails Added",
        description: "Please add at least one email to send invitations",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create invitations for each email
      const invitations = emails.map(email => ({
        group_id: groupId,
        email: email,
        status: 'pending',
        invited_by: user?.id
      }));
      
      const { error } = await supabase
        .from('group_invitations')
        .insert(invitations);
        
      if (error) throw error;
      
      toast({
        title: "Invitations Sent",
        description: `Successfully sent invitations to ${emails.length} people`,
      });
      
      // Close the modal
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending invitations:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Add Members to {currentGroup?.name || "Group"}</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Addresses
            </label>
            <div className="flex gap-2 mb-1">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddEmail}
                variant="secondary"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {emailError && (
              <p className="text-sm text-destructive mt-1">{emailError}</p>
            )}
            
            <div className="mt-4">
              {emails.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {emails.map(email => (
                    <div 
                      key={email}
                      className="bg-secondary flex items-center gap-2 py-1 px-3 rounded-full text-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No email addresses added yet. Add emails to invite people to this group.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || emails.length === 0}
            >
              {isLoading ? "Sending..." : "Send Invitations"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupMembersModal; 