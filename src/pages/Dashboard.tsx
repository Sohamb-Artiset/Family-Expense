import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currency";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import StatCard from "@/components/ui/StatCard";
import ExpenseCard from "@/components/ui/ExpenseCard";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Calendar, PieChart as PieChartIcon, Wallet, Bell, Edit2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import GroupCard from "@/components/ui/GroupCard";
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import EditGroupModal from "@/components/modals/EditGroupModal";
import { Group } from "@/types";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { 
    expenses, 
    chartData, 
    totalExpenseAmount, 
    isLoading, 
    groups, 
    groupsLoading,
    pendingInvitations,
    acceptInvitation,
    rejectInvitation
  } = useExpenses();
  const { user, profile } = useAuth();

  // Reverse the array to show latest expenses at the top
  const recentExpenses = expenses?.slice(0, 4).reverse() || [];
  const topGroups = groups?.slice(0, 3) || [];
  
  const userCurrency = profile?.default_currency || "INR";
  // const userCurrency = "INR";
  
  const budgetRemaining = (() => {
    if (!profile?.monthly_budget) return 0;
    return Math.max(0, profile.monthly_budget - totalExpenseAmount);
  })();
  
  const monthlyAverage = (() => {
    if (!expenses || expenses.length === 0) return 0;
    
    const today = new Date();
    const currMonth = today.getMonth();
    const currYear = today.getFullYear();
    
    const currentMonthExpenses = expenses.filter(expense => {
      try {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currMonth && expenseDate.getFullYear() === currYear;
      } catch (e) {
        return false;
      }
    });
    
    return currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 
           Math.max(1, new Date().getDate());
  })();
  
  const groupExpensesTotal = groups?.reduce((sum, group) => sum + group.totalExpenses, 0) || 0;
  
  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setEditGroupOpen(true);
  };
  
  // Helper function to generate category data for pie chart
  const generateCategoryData = () => {
    // Group expenses by category
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate the total amount
    
    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // Convert to array and calculate percentages
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    }));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className={cn("glass-card p-5 rounded-xl", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
          <div className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cn("glass-card rounded-xl p-5 lg:col-span-2", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
            <Skeleton className="h-6 w-32 mb-4" />
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="border-b border-border last:border-0 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
            <Skeleton className="h-6 w-32 mb-4" />
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <Skeleton className="h-[100px] w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Overview of your personal finances and expenses
        </p>
        
        {/* Add expense and create group buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsAddExpenseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
          <Button variant="outline" onClick={() => navigate('/groups')}>
            <Users className="mr-2 h-4 w-4" /> Create Group
          </Button>
        </div>
      </div>
      
      {pendingInvitations.length > 0 && (
        <div className={cn("glass-card rounded-xl p-4 mb-8", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-blue" />
              <h3 className="font-medium">Pending Invitations</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/invitations')}>
              View All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {pendingInvitations.slice(0, 2).map(invitation => (
              <div key={invitation.id} className="flex-1 min-w-[250px] border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{invitation.groupName}</p>
                    <p className="text-xs text-muted-foreground">From: {invitation.inviterName}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => rejectInvitation(invitation.id)}>
                    Decline
                  </Button>
                  <Button size="sm" onClick={() => acceptInvitation(invitation.id)}>
                    Accept
                  </Button>
                </div>
              </div>
            ))}
            
            {pendingInvitations.length > 2 && (
              <div className="flex items-center justify-center text-muted-foreground px-4">
                <p>+{pendingInvitations.length - 2} more invitations</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(totalExpenseAmount, userCurrency)}
          icon={<Wallet className="text-primary" />}
          trend={8.2}
          trendDesc="from last month"
        />
        <StatCard 
          title="Budget Remaining" 
          value={formatCurrency(budgetRemaining, userCurrency)}
          icon={<Activity className="text-blue" />}
          trend={-4.5}
          trendDesc="from last month"
          trendDirection="down"
          actionIcon={<Edit2 className="h-4 w-4" />}
          onAction={() => navigate('/profile')}
          actionTooltip="Edit budget"
        />
        <StatCard 
          title="Group Expenses" 
          value={formatCurrency(groupExpensesTotal, userCurrency)}
          icon={<PieChartIcon className="text-orange" />}
          trend={12.5}
          trendDesc="from last month"
        />
        <StatCard 
          title="Monthly Average" 
          value={formatCurrency(monthlyAverage, userCurrency)}
          icon={<Calendar className="text-green" />}
          trend={1.8}
          trendDesc="per day"
        />
      </div>
      
      {/* Recent Expenses and Top Groups section - now placed above charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className={cn("glass-card rounded-xl p-5 lg:col-span-2", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Recent Expenses</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/expenses')}>
              View All
            </Button>
          </div>
          
          <div>
            {recentExpenses.length > 0 ? (
              recentExpenses.map(expense => (
                <div key={expense.id} className="border-b border-border last:border-0 py-3">
                  <ExpenseCard expense={expense} />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No recent expenses found</p>
                <Button 
                  className="mt-2" 
                  size="sm" 
                  onClick={() => setIsAddExpenseModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Top Groups</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>
              View All
            </Button>
          </div>
          
          {!groupsLoading ? (
            topGroups.length > 0 ? (
              <div className="max-w-md overflow-x-auto scrollbar-hide">
                <div className="space-y-4 min-w-full">
                  {topGroups.slice(0, 2).map(group => (
                    <GroupCard 
                      key={group.id} 
                      group={group} 
                      onEdit={handleEditGroup}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No groups found</p>
                <Button className="mt-2" size="sm" onClick={() => navigate('/groups')}>
                  Create Group
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Charts section - now placed below Recent Expenses and Top Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
          <h3 className="font-medium mb-4">Expense Trends</h3>
          <div className="h-[300px]">
            <BarChart data={chartData} />
          </div>
        </div>
        <div className={cn("glass-card rounded-xl p-5", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
          <h3 className="font-medium mb-4">Spending by Category</h3>
          <div className="h-[300px]">
            {generateCategoryData().length > 0 ? (
              <PieChart data={generateCategoryData()} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AddExpenseModal 
        open={isAddExpenseModalOpen} 
        onOpenChange={setIsAddExpenseModalOpen} 
      />
      <EditGroupModal 
        open={editGroupOpen} 
        onOpenChange={setEditGroupOpen} 
        group={selectedGroup} 
      />
    </div>
  );
};

export default Dashboard;
