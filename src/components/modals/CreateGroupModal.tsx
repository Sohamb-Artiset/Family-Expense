import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [members, setMembers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createGroup } = useExpenses();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim() || !budget || parseFloat(budget) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid group name and budget",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a group",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process members
      const memberList = members
        .split(',')
        .map(member => member.trim())
        .filter(member => member !== "");
      
      // Create the group in Supabase
      const groupId = await createGroup({
        name: name.trim(),
        budget: parseFloat(budget),
        created: new Date().toLocaleDateString(),
        members: memberList
      });
      
      // If successful and got a group ID, navigate to that group
      if (groupId) {
        resetForm();
        onOpenChange(false);
        navigate(`/groups/${groupId}`);
      }
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setName("");
    setBudget("");
    setMembers("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Group</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                placeholder="Enter group name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <Input 
                  id="budget" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  className="pl-8" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="members">Members</Label>
              <Textarea 
                id="members" 
                placeholder="Enter email addresses separated by commas" 
                className="min-h-[80px]"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the email addresses of members you want to invite to this group. 
                Invitations will be sent to these addresses, and users can accept or decline.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
