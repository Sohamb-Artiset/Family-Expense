import React, { createContext, useContext, useState, useEffect } from "react";
import { mockExpenses } from "@/utils/mockData";
import { Expense, Group, ChartData, ExpenseTrend, ExpenseCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ExpenseContextType {
  expenses: Expense[];
  groups: Group[];
  trendData: ExpenseTrend[];
  chartData: ChartData[];
  categories: string[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  addCategory: (category: string) => Promise<void>;
  totalExpenseAmount: number;
  isLoading: boolean;
  createGroup: (group: Omit<Group, "id" | "totalExpenses">) => Promise<string | null>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  groupsLoading: boolean;
  pendingInvitations: GroupInvitation[];
  invitationsLoading: boolean;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  fetchInvitations: () => Promise<void>;
  currentGroup: Group | null;
  getGroupById: (id: string) => Promise<Group | null>;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  invitedBy: string;
  inviterName?: string;
}

export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [trendData, setTrendData] = useState<ExpenseTrend[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<GroupInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const { user, profile } = useAuth();

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    // Mock currency conversion rates
    const conversionRates: { [key: string]: { [key: string]: number } } = {
      USD: {
        INR: 80,
        USD: 1,
      },
      INR: {
        USD: 0.013,
        INR: 1,
      },
    };

    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = conversionRates[fromCurrency]?.[toCurrency];
    if (rate === undefined) {
      console.error(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
      return amount; // Return original amount if conversion rate is not found
    }

    return amount * rate;
  };
  
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchGroups();
      fetchCategories();
      fetchInvitations();
      setupRealtimeSubscription();
    } else {
      setExpenses([]);
      setGroups([]);
      setCategories(['Food', 'Rent', 'Travel', 'Shopping', 'Other']);
      setIsLoading(false);
      setGroupsLoading(false);
    }
    
    return () => {
      const subscription = supabase.channel('expenses-groups-changes');
      supabase.removeChannel(subscription);
    };
  }, [user]);
  
  useEffect(() => {
    const total = expenses.reduce((total, expense) => {
      const convertedAmount = convertCurrency(expense.amount, expense.currency, profile?.default_currency || "USD");
      return total + convertedAmount;
    }, 0);
    setTotalExpenseAmount(total);
    
    processChartData();
  }, [expenses, profile?.default_currency]);

  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('expense_categories')
        .select('name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      const categoryNames = data.map(category => category.name);
      setCategories(categoryNames);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
      setCategories(['Food', 'Rent', 'Travel', 'Shopping', 'Other']);
    }
  };
  
  const processChartData = () => {
    if (expenses.length === 0) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = months.map(month => ({
      name: month,
      month: month,
      amount: 0
    }));
    
    expenses.forEach(expense => {
      try {
        const date = new Date(expense.date);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].amount += expense.amount;
      } catch (error) {
        console.error("Error processing date:", expense.date);
      }
    });
    
    setTrendData(monthlyData);
    setChartData(monthlyData);
    
    const categoryData = processCategories();
  };
  
  const processCategories = () => {
    const categoryMap: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    const totalAmount = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryMap).map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    }));
  };

  const addCategory = async (category: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to add categories",
          variant: "destructive",
        });
        return;
      }
      
      if (categories.includes(category)) {
        return;
      }
      
      const { error } = await supabase
        .from('expense_categories')
        .insert({
          user_id: user.id,
          name: category
        });
      
      if (error) {
        if (error.code === '23505') {
          setCategories(prev => [...prev, category]);
          return;
        }
        throw error;
      }
      
      setCategories(prev => [...prev, category]);
      
      toast({
        title: "Category added",
        description: `Added "${category}" to your categories`,
      });
    } catch (error: any) {
      console.error("Error adding category:", error.message);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };
  
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('expenses-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchExpenses();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups'
        },
        () => {
          fetchGroups();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members'
        },
        () => {
          fetchGroups();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expense_categories',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();
  };
  
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const transformedExpenses: Expense[] = data.map(item => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        date: new Date(item.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        category: item.category,
        group: groups.find(g => g.id === item.group_id)?.name,
        currency: item.currency || "USD"
      }));
      
      setExpenses(transformedExpenses);
    } catch (error: any) {
      console.error("Error fetching expenses:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*');
      
      if (groupsError) throw groupsError;
      
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*');
      
      if (membersError) throw membersError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .in('group_id', groupsData.map(g => g.id));
      
      if (expensesError) throw expensesError;

      const transformedGroups: Group[] = groupsData.map(group => {
        const groupMemberIds = membersData
          .filter(m => m.group_id === group.id)
          .map(m => m.user_id);

        const memberProfiles = groupMemberIds.map(userId => {
          return profilesData.find(p => p.id === userId) || { id: userId };
        });

        const membersList = memberProfiles.map(profile => {
          if (profile && typeof profile !== 'undefined' && profile?.id) {
            if ('full_name' in profile && profile.full_name) {
              return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
            }
            if ('username' in profile && profile.username) {
              return profile.username.substring(0, 2).toUpperCase();
            }
          }
          return (profile?.id) ? profile?.id?.substring(0, 2).toUpperCase() : 'XX';
        });

        const memberDetails = memberProfiles.map(profile => {
          const displayName = (profile && 'full_name' in profile && profile.full_name) ? profile.full_name : (profile && 'username' in profile && profile.username) ? profile.username : (profile?.id) ? `User ${profile?.id?.substring(0, 6)}` : 'Unknown User';
          return {
            id: profile?.id,
            name: displayName,
            initials: (profile && 'full_name' in profile && profile.full_name) ? 
              profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 
              (profile && 'username' in profile && profile.username) ? profile.username.substring(0, 2).toUpperCase() : 
              (profile?.id) ? profile?.id?.substring(0, 2).toUpperCase() : 'XX'
          };
        });

        const groupExpensesTotal = expensesData
          .filter(e => e.group_id === group.id)
          .reduce((sum, expense) => sum + Number(expense.amount), 0);

        return {
          id: group.id,
          name: group.name,
          budget: Number(group.budget || 0),
          totalExpenses: groupExpensesTotal,
          created: new Date(group.created_at).toLocaleDateString(),
          members: membersList,
          memberDetails: memberDetails
        };
      });
      
      setGroups(transformedGroups);
    } catch (error: any) {
      console.error("Error fetching groups:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    } finally {
      setGroupsLoading(false);
    }
  };
  
  const getGroupById = async (id: string) => {
    try {
      setGroupsLoading(true);
      
      // First check if it's already in our state
      const existingGroup = groups.find(g => g.id === id);
      if (existingGroup) {
        setCurrentGroup(existingGroup);
        setGroupsLoading(false);
        return existingGroup;
      }
      
      // Otherwise fetch from supabase
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (groupError) throw groupError;
      
      // Check if user is a member of this group
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', id);
      
      if (memberError) throw memberError;
      
      // Only allow access if user is a member or creator
      const isUserMember = memberData.some(member => member.user_id === user?.id);
      if (!isUserMember && groupData.created_by !== user?.id) {
        throw new Error("You are not a member of this group");
      }
      
      // Get all members' profiles
      const memberIds = memberData.map(member => member.user_id);
      
      // Make sure creator is included in the member list
      if (!memberIds.includes(groupData.created_by)) {
        memberIds.push(groupData.created_by);
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberIds);
      
      if (profilesError) throw profilesError;
      
      // Get group expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', id);
      
      if (expensesError) throw expensesError;
      
      // Format the member details like in fetchGroups
      const membersList = profilesData.map(profile => {
        if (profile.full_name) {
          return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        if (profile.username) {
          return profile.username.substring(0, 2).toUpperCase();
        }
        return profile.id.substring(0, 2).toUpperCase();
      });
      
      const memberDetails = profilesData.map(profile => {
        const displayName = profile.full_name || profile.username || `User ${profile.id.substring(0, 6)}`;
        return {
          id: profile.id,
          name: displayName,
          initials: profile.full_name ? 
            profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 
            profile.username ? profile.username.substring(0, 2).toUpperCase() : 
            profile.id.substring(0, 2).toUpperCase()
        };
      });
      
      // Calculate total expenses
      const groupExpensesTotal = expensesData
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      // Create the formatted group object
      const formattedGroup = {
        id: groupData.id,
        name: groupData.name,
        budget: Number(groupData.budget || 0),
        totalExpenses: groupExpensesTotal,
        created: new Date(groupData.created_at).toLocaleDateString(),
        created_by: groupData.created_by,
        members: membersList,
        memberDetails: memberDetails
      };
      
      setCurrentGroup(formattedGroup);
      setGroupsLoading(false);
      return formattedGroup;
    } catch (error: any) {
      console.error("Error fetching group:", error.message);
      setGroupsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to load group",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const addExpense = async (newExpense: Omit<Expense, "id">) => {
    const expenseWithId = { ...newExpense, id: uuidv4() };
    setExpenses(prev => [expenseWithId, ...prev]);
    
    if (newExpense.group) {
      await updateGroupExpenses(expenseWithId as Expense);
    }
  };
  
  const updateGroupExpenses = (expense: Expense, isAdding: boolean = true) => {
    if (expense.group) {
      setGroups(prevGroups => 
        prevGroups.map(group => {
          if (group.name === expense.group) {
            const amountChange = isAdding ? expense.amount : -expense.amount;
            return {
              ...group,
              totalExpenses: group.totalExpenses + amountChange
            };
          }
          return group;
        })
      );
    }
  };
  
  const deleteExpense = async (id: string) => {
    try {
      const expenseToDelete = expenses.find(e => e.id === id);
      if (!expenseToDelete) return;
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      if (expenseToDelete.group) {
        setGroups(prevGroups => 
          prevGroups.map(group => {
            if (group.name === expenseToDelete.group) {
              return {
                ...group,
                totalExpenses: Math.max(0, group.totalExpenses - expenseToDelete.amount)
              };
            }
            return group;
          })
        );
      }
      
      toast({
        title: "Expense Deleted",
        description: `Removed ${expenseToDelete.title}`,
      });
    } catch (error: any) {
      console.error("Error deleting expense:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };
  
  const updateExpense = async (id: string, updatedExpense: Partial<Expense>) => {
    try {
      const oldExpense = expenses.find(e => e.id === id);
      if (!oldExpense) return;
      
      const supabaseData: any = { ...updatedExpense };
      if (updatedExpense.date) {
        try {
          const date = new Date(updatedExpense.date);
          supabaseData.date = date.toISOString().split('T')[0];
        } catch (error) {
          console.error("Error formatting date:", error);
        }
      }
      if (updatedExpense.group !== undefined) {
        const group = groups.find(g => g.name === updatedExpense.group);
        supabaseData.group_id = group?.id || null;
        delete supabaseData.group;
      }
      
      const { error } = await supabase
        .from('expenses')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setExpenses(prev => 
        prev.map(expense => {
          if (expense.id === id) {
            return { ...expense, ...updatedExpense };
          }
          return expense;
        })
      );
      
      if (oldExpense && updatedExpense.group && oldExpense.group !== updatedExpense.group) {
        if (oldExpense.group) {
          setGroups(prev => 
            prev.map(group => {
              if (group.name === oldExpense.group) {
                return {
                  ...group,
                  totalExpenses: group.totalExpenses - oldExpense.amount
                };
              }
              return group;
            })
          );
        }
        
        setGroups(prev => 
          prev.map(group => {
            if (group.name === updatedExpense.group) {
              return {
                ...group,
                totalExpenses: group.totalExpenses + (oldExpense?.amount || 0)
              };
            }
            return group;
          })
        );
      }
      
      if (oldExpense && updatedExpense.amount && oldExpense.amount !== updatedExpense.amount) {
        if (oldExpense.group) {
          setGroups(prev => 
            prev.map(group => {
              if (group.name === oldExpense.group) {
                const amountDiff = (updatedExpense.amount || oldExpense.amount) - oldExpense.amount;
                return {
                  ...group,
                  totalExpenses: group.totalExpenses + amountDiff
                };
              }
              return group;
            })
          );
        }
      }
      
      toast({
        title: "Expense Updated",
        description: `Updated ${oldExpense?.title || 'expense'}`,
      });
    } catch (error: any) {
      console.error("Error updating expense:", error.message);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const createGroup = async (groupData: Omit<Group, "id" | "totalExpenses">): Promise<string | null> => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create a group",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupData.name,
          budget: groupData.budget,
          created_by: user.id,
          description: ''
        })
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id
        });

      if (memberError) throw memberError;

      if (groupData.members && groupData.members.length > 0) {
        const invitations = groupData.members.map(email => ({
          group_id: data.id,
          email: email.trim().toLowerCase(),
          status: 'pending',
          invited_by: user.id
        }));

        const { error: inviteError } = await supabase
          .from('group_invitations')
          .insert(invitations);

        if (inviteError) {
          console.error("Error sending invitations:", inviteError);
          toast({
            title: "Invitation Error",
            description: "Created group but couldn't send all invitations",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invitations Sent",
            description: `${groupData.members.length} members have been invited to join the group.`,
          });
        }
      }

      toast({
        title: "Group Created",
        description: `Successfully created the ${groupData.name} group`,
      });

      return data.id;
    } catch (error: any) {
      console.error("Error creating group:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGroup = async (id: string, data: Partial<Group>) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: data.name,
          budget: data.budget,
          description: ''
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Group Updated",
        description: `Successfully updated the group details`,
      });
    } catch (error: any) {
      console.error("Error updating group:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      // Check if user is the creator of the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', id)
        .single();
      
      if (groupError) throw groupError;
      
      if (groupData.created_by !== user?.id) {
        toast({
          title: "Permission Denied",
          description: "Only the creator of the group can delete it",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Group Deleted",
        description: "The group has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting group:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const fetchInvitations = async () => {
    if (!user) return;
    
    try {
      setInvitationsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;
      
      if (!userEmail) {
        console.error("Could not get user email");
        return;
      }
      
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('email', userEmail)
        .eq('status', 'pending');
      
      if (invitationsError) throw invitationsError;
      
      const groupIds = invitationsData.map(inv => inv.group_id);
      
      if (groupIds.length === 0) {
        setPendingInvitations([]);
        return;
      }
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
      
      if (groupsError) throw groupsError;
      
      const inviterIds = invitationsData.map(inv => inv.invited_by);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', inviterIds);
      
      if (profilesError) throw profilesError;
      
      const transformedInvitations: GroupInvitation[] = invitationsData.map(invitation => {
        const group = groupsData.find(g => g.id === invitation.group_id);
        const inviter = profilesData.find(p => p.id === invitation.invited_by);
        
        return {
          id: invitation.id,
          groupId: invitation.group_id,
          groupName: group?.name || 'Unknown Group',
          email: invitation.email,
          status: invitation.status as 'pending' | 'accepted' | 'rejected',
          createdAt: new Date(invitation.created_at).toLocaleDateString(),
          invitedBy: invitation.invited_by,
          inviterName: inviter?.full_name || inviter?.username || 'Unknown User'
        };
      });
      
      setPendingInvitations(transformedInvitations);
    } catch (error: any) {
      console.error("Error fetching invitations:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch group invitations",
        variant: "destructive",
      });
    } finally {
      setInvitationsLoading(false);
    }
  };
  
  const acceptInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);
      
      if (error) throw error;
      
      toast({
        title: "Invitation Accepted",
        description: "You've been added to the group",
      });
      
      fetchInvitations();
      fetchGroups();
    } catch (error: any) {
      console.error("Error accepting invitation:", error.message);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };
  
  const rejectInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);
      
      if (error) throw error;
      
      toast({
        title: "Invitation Rejected",
        description: "You've declined the group invitation",
      });
      
      fetchInvitations();
    } catch (error: any) {
      console.error("Error rejecting invitation:", error.message);
      toast({
        title: "Error",
        description: "Failed to reject invitation",
        variant: "destructive",
      });
    }
  };
  
  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        groups,
        trendData,
        chartData,
        categories,
        addExpense,
        deleteExpense,
        updateExpense,
        addCategory,
        totalExpenseAmount,
        isLoading,
        createGroup,
        updateGroup,
        deleteGroup,
        groupsLoading,
        pendingInvitations,
        invitationsLoading,
        acceptInvitation,
        rejectInvitation,
        fetchInvitations,
        currentGroup,
        getGroupById
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
