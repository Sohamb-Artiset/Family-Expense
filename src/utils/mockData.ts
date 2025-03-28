
import { ExpenseCategory, Expense, Group, ChartData, CategoryInsight, ExpenseInsight, ExpenseTrend } from "@/types";

export const mockExpenses: Expense[] = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: 75.50,
    date: "5/15/2023",
    category: "Food",
    currency: "USD"
  },
  {
    id: "2",
    title: "Monthly Rent",
    amount: 1200.00,
    date: "5/1/2023",
    category: "Rent",
    currency: "USD"
  },
  {
    id: "3",
    title: "Flight Tickets",
    amount: 350.00,
    date: "5/12/2023",
    category: "Travel",
    group: "Family Trip",
    currency: "USD"
  },
  {
    id: "4",
    title: "Dinner with Friends",
    amount: 120.00,
    date: "5/20/2023",
    category: "Food",
    group: "Friends Hangout",
    currency: "USD"
  },
  {
    id: "5",
    title: "New Laptop",
    amount: 1499.99,
    date: "5/10/2023",
    category: "Shopping",
    currency: "USD"
  },
  {
    id: "6",
    title: "Gym Membership",
    amount: 50.00,
    date: "5/5/2023",
    category: "Other",
    currency: "USD"
  }
];

export const mockGroups: Group[] = [
  {
    id: "1",
    name: "Family",
    totalExpenses: 520.75,
    budget: 1000,
    created: "1/15/2023",
    members: ["JO", "JA", "MA"]
  },
  {
    id: "2",
    name: "College Trip",
    totalExpenses: 875.50,
    budget: 1000,
    created: "4/5/2023",
    members: ["JO", "AL", "SA", "MI", "EM", "+1"]
  },
  {
    id: "3",
    name: "Work Project",
    totalExpenses: 340.25,
    budget: 500,
    created: "3/20/2023",
    members: ["JO", "RC", "LI"]
  },
  {
    id: "4",
    name: "Friends Hangout",
    totalExpenses: 210.00,
    budget: 400,
    created: "5/10/2023",
    members: ["JO", "AL", "CH", "JE"]
  }
];

export const monthlyExpenseData: ChartData[] = [
  { name: "Jan", amount: 1850 },
  { name: "Feb", amount: 2000 },
  { name: "Mar", amount: 1950 },
  { name: "Apr", amount: 2150 },
  { name: "May", amount: 2455 },
  { name: "Jun", amount: 2050 }
];

export const categoryData: CategoryInsight[] = [
  { category: "Rent", amount: 1200, percentage: 49 },
  { category: "Food", amount: 450, percentage: 18 },
  { category: "Travel", amount: 350, percentage: 14 },
  { category: "Shopping", amount: 270, percentage: 11 },
  { category: "Other", amount: 185, percentage: 7 }
];

export const expenseInsights: ExpenseInsight[] = [
  {
    title: "Total Expenses",
    value: "$2455",
    trend: 6.7
  },
  {
    title: "Average Daily",
    value: "$81.83"
  },
  {
    title: "Biggest Expense",
    value: "$1200"
  }
];

// These stats are only used as fallbacks now, as the Dashboard now calculates dynamic values
export const dashboardStats = [
  {
    title: "Total Expenses (May)",
    value: "$2455",
    trend: 6.7,
    color: "blue",
    desc: "from last month",
    currency: "USD",
    amountInUSD: 2455
  },
  {
    title: "Budget Remaining",
    value: "$545",
    desc: "18.2% of budget left",
    color: "green",
    currency: "USD",
    amountInUSD: 545
  },
  {
    title: "Group Expenses",
    value: "$1396",
    desc: "Across 2 groups",
    color: "purple",
    currency: "USD",
    amountInUSD: 1396
  },
  {
    title: "Monthly Average",
    value: "$2118",
    desc: "Based on last 6 months",
    color: "orange",
    currency: "USD",
    amountInUSD: 2118
  }
];

export const expenseTrends: ExpenseTrend[] = [
  { month: "Jan", amount: 1850, name: "Jan" },
  { month: "Feb", amount: 2000, name: "Feb" },
  { month: "Mar", amount: 1950, name: "Mar" },
  { month: "Apr", amount: 2150, name: "Apr" },
  { month: "May", amount: 2450, name: "May" },
  { month: "Jun", amount: 2050, name: "Jun" }
];
