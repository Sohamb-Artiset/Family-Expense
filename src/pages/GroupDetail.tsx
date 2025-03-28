import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, UserPlus, Settings, Trash } from "lucide-react";
import ExpenseCard from "@/components/ui/ExpenseCard";
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import AddGroupMembersModal from "@/components/modals/AddGroupMembersModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/contexts/ExpenseContext";
import { supabase } from "@/integrations/supabase/client";
import { Expense, ExpenseCategory, Group } from "@/types";
import { ExpenseContext } from "@/contexts/ExpenseContext";
import { toast } from "@/hooks/use-toast";

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { getGroupById } = useExpenses();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Map<string, string>>(new Map());
  const { currentGroup, user } = useContext(ExpenseContext);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const isCreator = currentGroup?.created_by === user?.id;
  
  useEffect(() => {
    if (groupId) {
      // Fetch the group data
      const loadGroup = async () => {
        try {
          const result = await getGroupById(groupId);
          if (!result) {
            toast({
              title: "Error",
              description: "Could not load group details",
              variant: "destructive",
            });
            navigate('/groups');
          }
        } catch (error: any) {
          console.error("Error loading group:", error.message);
          toast({
            title: "Error",
            description: error.message || "Failed to load group details",
            variant: "destructive",
          });
          navigate('/groups');
        }
      };
      
      loadGroup();
      fetchGroupExpenses();
      fetchUserProfiles();
      setupRealtimeSubscription();
    }
    
    return () => {
      const subscription = supabase.channel('expenses-changes');
      supabase.removeChannel(subscription);
    };
  }, [groupId, getGroupById, navigate]);
  
  const fetchUserProfiles = async () => {
    if (!groupId) return;
    
    try {
      // Get all members of this group
      const { data: groupMembersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
        
      if (membersError) throw membersError;
      
      if (!groupMembersData || groupMembersData.length === 0) {
        return;
      }
      
      const memberIds = groupMembersData.map(member => member.user_id);
      
      // Fetch detailed profiles for all group members
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', memberIds);
      
      if (error) throw error;
      
      const profileMap = new Map();
      if (data) {
        data.forEach(profile => {
          // Use full name, username, or a combination for the best display name
          let displayName = profile.full_name || profile.username || '';
          
          // If we still don't have a good name, try to extract from id
          if (!displayName) {
            // Use the beginning of the uuid as a last resort
            displayName = `User ${profile.id.substring(0, 6)}`;
          }
          
          profileMap.set(profile.id, displayName);
        });
      }
      
      // Get the user profiles from the current group's memberDetails if available
      if (currentGroup && currentGroup.memberDetails) {
        currentGroup.memberDetails.forEach(member => {
          if (!profileMap.has(member.id) && member.name !== 'Unknown') {
            profileMap.set(member.id, member.name);
          }
        });
      }
      
      console.log("User Profiles Map:", Object.fromEntries(profileMap));
      setUserProfiles(profileMap);
    } catch (error: any) {
      console.error("Error fetching profiles:", error.message);
    }
  };
  
  const fetchGroupExpenses = async () => {
    if (!groupId) return;
    
    setIsLoading(true);
    
    try {
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: false });
      
      if (expensesError) {
        throw expensesError;
      }
      
      if (!expensesData) {
        setGroupExpenses([]);
        setIsLoading(false);
        return;
      }
      
      const uniqueUserIds = [...new Set(expensesData.map(expense => expense.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', uniqueUserIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      const userMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          // Use the best available name
          const displayName = profile.full_name || profile.username || `User ${profile.id.substring(0, 6)}`;
          userMap.set(profile.id, displayName);
        });
      }
      
      // Also use memberDetails if available
      if (currentGroup && currentGroup.memberDetails) {
        currentGroup.memberDetails.forEach(member => {
          if (!userMap.has(member.id) && member.name !== 'Unknown') {
            userMap.set(member.id, member.name);
          }
        });
      }
      
      const transformedExpenses: Expense[] = expensesData.map(item => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        date: new Date(item.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        category: item.category as ExpenseCategory,
        group: currentGroup?.name,
        createdBy: userMap.get(item.user_id) || "Member",
        userId: item.user_id,
        currency: item.currency || "INR"
      }));
      
      setGroupExpenses(transformedExpenses);
    } catch (error: any) {
      console.error("Error fetching group expenses:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          fetchGroupExpenses();
        }
      )
      .subscribe();
  };
  
  const handleLeaveGroup = async () => {
    if (!user || !groupId || isCreator) return;
    
    try {
      setIsLeaving(true);
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Left Group",
        description: "You have successfully left the group",
      });
      
      // Navigate back to groups page
      navigate('/groups');
    } catch (error: any) {
      console.error("Error leaving group:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to leave the group",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };
  
  if (!currentGroup) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-md text-center">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/groups')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl mb-4">Group not found</p>
            <p className="text-muted-foreground mb-6">
              The group you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/groups')}>
              Go to My Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const calculateMemberExpenses = () => {
    const result = {};
    
    // Initialize with all members from memberDetails if available
    if (currentGroup.memberDetails && currentGroup.memberDetails.length > 0) {
      currentGroup.memberDetails.forEach(member => {
        // Use a clean name (not "Unknown" or partial UUIDs)
        const displayName = member.name.includes("User ") ? "Member" : member.name;
        result[displayName] = 0;
      });
    } else {
      // Fallback to using userProfiles
      for (const [userId, displayName] of userProfiles.entries()) {
        const cleanName = displayName.includes("User ") ? "Member" : displayName;
        result[cleanName] = 0;
      }
    }
    
    // If we still don't have any members, create at least one entry for expenses
    if (Object.keys(result).length === 0 && groupExpenses.length > 0) {
      const uniqueCreators = [...new Set(groupExpenses.map(exp => exp.createdBy))];
      uniqueCreators.forEach(creator => {
        const cleanName = creator.includes("User ") ? "Member" : creator;
        result[cleanName] = 0;
      });
    }
    
    // Sum up expenses for each user
    groupExpenses.forEach(expense => {
      if (!expense.userId) return;
      
      // Try to find the member name from memberDetails
      let displayName = expense.createdBy;
      
      if (currentGroup.memberDetails) {
        const member = currentGroup.memberDetails.find(m => m.id === expense.userId);
        if (member) {
          displayName = member.name.includes("User ") ? "Member" : member.name;
        }
      } else if (userProfiles.has(expense.userId)) {
        const profileName = userProfiles.get(expense.userId);
        displayName = profileName.includes("User ") ? "Member" : profileName;
      }
      
      // Clean any remaining "User UUID" format names
      if (displayName.includes("User ")) {
        displayName = "Member";
      }
      
      if (result[displayName] !== undefined) {
        result[displayName] += expense.amount;
      } else {
        // Handle expenses by users who are no longer in the group or have unknown names
        result[displayName] = (result[displayName] || 0) + expense.amount;
      }
    });
    
    return result;
  };
  
  const memberExpenses = calculateMemberExpenses();
  
  const budgetPercentage = (currentGroup.totalExpenses / currentGroup.budget) * 100;
  const isOverBudget = budgetPercentage > 100;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/groups')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
        </Button>
        
        <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue rounded-full w-10 h-10 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold">{currentGroup.name}</h1>
            </div>
            <p className="text-muted-foreground mb-1">Created {currentGroup.created}</p>
            <p className="text-blue font-medium">Total Expenses: ₹{currentGroup.totalExpenses.toFixed(2)}</p>
          </div>
          
          <div className="flex gap-2 mt-4 lg:mt-0">
            {isCreator && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/groups/${groupId}/settings`)}
                  className="flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setAddMembersOpen(true)}
                  className="flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Add Members
                </Button>
              </>
            )}
            
            <Button 
              onClick={() => setAddExpenseOpen(true)}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Group Expense
            </Button>
            
            {!isCreator && (
              <Button 
                variant="destructive" 
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="flex items-center"
              >
                {isLeaving ? "Leaving..." : "Leave Group"}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              ₹{currentGroup.totalExpenses.toFixed(2)} / ₹{currentGroup.budget.toFixed(2)}
            </div>
            <div className="progress-bar mt-2">
              <div 
                className={`progress-value ${isOverBudget ? 'bg-destructive' : ''}`} 
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-2 ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
              {isOverBudget 
                ? `Over budget by $${(currentGroup.totalExpenses - currentGroup.budget).toFixed(2)}` 
                : `${budgetPercentage.toFixed(0)}% of budget used`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Member Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(memberExpenses).map(([member, amount]) => (
                <div key={member} className="bg-secondary rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">{member}</div>
                  <div className="font-medium">₹{(amount as number).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentGroup.totalExpenses > 0 
                      ? ((amount as number / currentGroup.totalExpenses) * 100).toFixed(0) 
                      : '0'}% of total
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Group Expenses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        ) : groupExpenses.length > 0 ? (
          groupExpenses.map((expense) => (
            <div key={expense.id} className="expense-with-member">
              <div className="expense-member-tag">
                {expense.createdBy || 'Unknown'}
              </div>
              <ExpenseCard expense={expense} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No expenses found for this group yet.</p>
            <Button className="mt-4" onClick={() => setAddExpenseOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add First Expense
            </Button>
          </div>
        )}
      </div>
      
      <AddExpenseModal 
        open={addExpenseOpen} 
        onOpenChange={setAddExpenseOpen} 
        defaultGroup={currentGroup.name} 
      />
      
      {groupId && (
        <AddGroupMembersModal
          open={addMembersOpen}
          onOpenChange={setAddMembersOpen}
          groupId={groupId}
        />
      )}
    </div>
  );
};

export default GroupDetail;
