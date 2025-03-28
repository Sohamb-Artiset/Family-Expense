export type ExpenseCategory = 'Food' | 'Rent' | 'Travel' | 'Shopping' | 'Other' | string;

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  group?: string;
  createdBy?: string; // Adding creator information
  userId?: string; // Adding user ID information
  currency: string; // Adding currency
}

export interface Group {
  id: string;
  name: string;
  totalExpenses: number;
  budget: number;
  created: string;
  members: string[];
  memberDetails?: GroupMember[];
}

export interface GroupMember {
  id: string;
  name: string;
  initials: string;
}

export interface User {
  id: string;
  initials: string;
}

export interface ChartData {
  name: string;
  amount: number;
}

export interface CategoryInsight {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface ExpenseInsight {
  title: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
}

export interface ExpenseTrend {
  month: string;
  amount: number;
  name: string; // Added name property to match ChartData
}
