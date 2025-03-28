import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExpenseContext } from "@/contexts/ExpenseContext";
import { ArrowLeft, Save, Trash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GroupSettings = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentGroup, updateGroup, deleteGroup, user, getGroupById } = useContext(ExpenseContext);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  useEffect(() => {
    if (groupId) {
      getGroupById(groupId);
    }
  }, [groupId]);
  
  useEffect(() => {
    if (currentGroup) {
      setName(currentGroup.name);
      setBudget(currentGroup.budget.toString());
      fetchGroupMembers();
    }
  }, [currentGroup]);
  
  useEffect(() => {
    if (currentGroup?.created_by !== user?.id) {
      // Redirect if not the creator
      toast({
        title: "Permission Denied",
        description: "Only the creator of the group can access settings",
        variant: "destructive",
      });
      navigate(`/groups/${groupId}`);
    }
  }, [currentGroup, user, groupId, navigate]);
  
  const fetchGroupMembers = async () => {
    if (!groupId) return;
    
    setIsLoadingMembers(true);
    
    try {
      // Get all members of this group
      const { data: groupMembersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
        
      if (membersError) throw membersError;
      
      if (!groupMembersData || groupMembersData.length === 0) {
        setMembers([]);
        setIsLoadingMembers(false);
        return;
      }
      
      const memberIds = groupMembersData.map(member => member.user_id);
      
      // Fetch member profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', memberIds);
      
      if (profilesError) throw profilesError;
      
      // Add creator if not in members list
      if (currentGroup?.created_by && !memberIds.includes(currentGroup.created_by)) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('id', currentGroup.created_by)
          .single();
          
        if (!creatorError && creatorData) {
          profilesData.push(creatorData);
        }
      }
      
      const formattedMembers = profilesData.map(profile => ({
        id: profile.id,
        name: profile.full_name || profile.username || `User ${profile.id.substring(0, 6)}`
      }));
      
      setMembers(formattedMembers);
    } catch (error: any) {
      console.error("Error fetching group members:", error.message);
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!groupId || !currentGroup || currentGroup.created_by === memberId) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      toast({
        title: "Member Removed",
        description: "Successfully removed member from the group",
      });
      
      // Update the members list
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error: any) {
      console.error("Error removing member:", error.message);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Invalid Group Name",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(Number(budget)) || Number(budget) <= 0) {
      toast({
        title: "Invalid Budget",
        description: "Budget must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateGroup(groupId!, {
        name: name.trim(),
        budget: Number(budget)
      });
      
      toast({
        title: "Settings Saved",
        description: "Group settings updated successfully",
      });
      
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    setIsLoading(true);
    
    try {
      await deleteGroup(groupId!);
      navigate('/groups');
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  if (!currentGroup || currentGroup.created_by !== user?.id) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-md">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(`/groups/${groupId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Group
      </Button>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter budget amount"
                  min="0"
                  step="any"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/groups/${groupId}`)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMembers ? (
              <p className="text-muted-foreground text-center py-4">Loading members...</p>
            ) : members.length > 0 ? (
              <div className="space-y-3">
                {members.map(member => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-secondary rounded-full w-8 h-8 flex items-center justify-center">
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.id === currentGroup.created_by ? "Creator" : "Member"}
                        </p>
                      </div>
                    </div>
                    {member.id !== currentGroup.created_by && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No members in this group yet.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-xl text-destructive flex items-center gap-2">
              <Trash className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Deleting this group will permanently remove all associated expenses and data.
              This action cannot be undone.
            </p>
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the "{currentGroup.name}" group and all of its 
                    associated expenses. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteGroup}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isLoading ? "Deleting..." : "Delete Group"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupSettings; 