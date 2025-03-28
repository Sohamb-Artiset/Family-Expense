
import React, { useState, useEffect } from "react";
import StatCard from "@/components/ui/StatCard";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import { Button } from "@/components/ui/button";
import { TrendingDown, BarChart3, PieChart as PieChartIcon, ArrowUp, CreditCard, Coffee, Utensils } from "lucide-react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryInsight } from "@/types";
import { formatCurrency } from "@/utils/currency";

const Analytics = () => {
  const { expenses, trendData, totalExpenseAmount, isLoading } = useExpenses();
  const { user, profile } = useAuth();
  const [timeMode, setTimeMode] = useState<'Weekly' | 'Monthly'>('Monthly');
  const [categoryData, setCategoryData] = useState<CategoryInsight[]>([]);
  
  // Get user currency
  const userCurrency = profile?.default_currency || "INR";
  // const userCurrency = "INR";
  
  // Process category data when expenses change
  useEffect(() => {
    if (expenses.length === 0) return;
    
    const categoryMap: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    const totalAmount = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);
    
    const categoryInsights = Object.entries(categoryMap).map(([category, amount]) => ({
      category: category as any,
      amount,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    }));
    
    setCategoryData(categoryInsights);
  }, [expenses]);
  
  // Calculate current month's expenses
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const currentMonthExpense = trendData.find(item => item.name === currentMonth)?.amount || 0;
  
  // Format currency values
  const formattedTotalAmount = formatCurrency(totalExpenseAmount, userCurrency);
  const formattedDailyAverage = expenses.length > 0 
    ? formatCurrency((totalExpenseAmount / 30), userCurrency)
    : formatCurrency(0, userCurrency);
  const formattedBiggestExpense = formatCurrency(
    Math.max(...expenses.map(exp => exp.amount), 0),
    userCurrency
  );
  
  // Dynamically generate expense insights
  const expenseInsights = [
    {
      title: "Total Expenses",
      value: formattedTotalAmount,
      trend: 6.7 // This would be calculated by comparing with previous period
    },
    {
      title: "Average Daily",
      value: formattedDailyAverage
    },
    {
      title: "Biggest Expense",
      value: formattedBiggestExpense
    }
  ];
  
  // Find most frequent category
  const getMostFrequentCategory = () => {
    const categoryCounts: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
    });
    
    let mostFrequent = { category: 'None', count: 0 };
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > mostFrequent.count) {
        mostFrequent = { category, count };
      }
    });
    
    return mostFrequent;
  };
  
  const mostFrequent = getMostFrequentCategory();
  
  // Find highest expense category
  const getHighestExpenseCategory = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    let highest = { category: 'None', amount: 0 };
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > highest.amount) {
        highest = { category, amount };
      }
    });
    
    return highest;
  };
  
  const highestExpense = getHighestExpenseCategory();
  
  // Format highest expense value
  const formattedHighestExpenseAmount = formatCurrency(highestExpense.amount, userCurrency);
  
  const insights = [
    {
      title: "Highest Expense",
      value: formattedHighestExpenseAmount,
      subtitle: highestExpense.category,
      icon: <TrendingDown className="w-4 h-4 text-destructive" />,
    },
    {
      title: "Highest Saving",
      value: formatCurrency(150, userCurrency),
      subtitle: "Travel (-30%)",
      icon: <ArrowUp className="w-4 h-4 text-green-500" />,
    },
    {
      title: "Most Frequent",
      value: `${mostFrequent.count} times`,
      subtitle: mostFrequent.category,
      icon: <Utensils className="w-4 h-4 text-orange-500" />,
    },
  ];
  
  // These would be more dynamic based on actual data analysis
  const recommendations = [
    {
      title: "Reduce Food Expenses",
      description: "You spent 15% more on food this month compared to your average. Consider cooking more meals at home.",
      icon: <Coffee className="w-5 h-5 text-blue" />,
    },
    {
      title: "Set Budget for Shopping",
      description: "Your shopping expenses are increasing. Consider setting a monthly budget for this category.",
      icon: <CreditCard className="w-5 h-5 text-blue" />,
    },
    {
      title: "Good Job on Travel Savings",
      description: "You've reduced your travel expenses by 30% compared to last month. Keep it up!",
      icon: <ArrowUp className="w-5 h-5 text-green-500" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Sign in to view your analytics</h2>
        <p className="text-muted-foreground">You need to be signed in to see your expense analytics.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analytics</h1>
          <p className="text-muted-foreground">Track and visualize your spending habits</p>
        </div>
        
        <div className="flex space-x-1 p-1 bg-secondary rounded-lg mt-4 md:mt-0">
          <Button
            variant={timeMode === 'Weekly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeMode('Weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timeMode === 'Monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeMode('Monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>
      
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No expenses found</h2>
          <p className="text-muted-foreground mb-6">Add some expenses to see your analytics</p>
        </div>
      ) : (
        <>
          {/* Insights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {expenseInsights.map((insight, index) => (
              <StatCard
                key={index}
                title={insight.title}
                value={insight.value}
                trend={insight.trend}
              />
            ))}
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="glass-card rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Monthly Expenses</h3>
                  <p className="text-sm text-muted-foreground">Expense trend over time</p>
                </div>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <BarChart data={trendData} />
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Expense Categories</h3>
                  <p className="text-sm text-muted-foreground">Distribution by category</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <PieChart data={categoryData} />
            </div>
          </div>
          
          {/* Expense Insights Section */}
          <h2 className="text-2xl font-semibold mb-5">Expense Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {insights.map((insight, index) => (
              <div key={index} className="glass-card rounded-xl p-5 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-muted-foreground">{insight.title}</h3>
                  {insight.icon}
                </div>
                <div className="text-2xl font-bold">{insight.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{insight.subtitle}</div>
              </div>
            ))}
          </div>
          
          {/* Recommendations Section */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-5">Spending Recommendations</h2>
            <p className="text-sm text-muted-foreground mb-6">Tips to improve your financial health</p>
            
            <div className="space-y-6">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-4">
                  <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {recommendation.icon}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
