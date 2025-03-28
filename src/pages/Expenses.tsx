import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, FolderPlus } from "lucide-react";
import ExpenseCard from "@/components/ui/ExpenseCard";
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import { ExpenseCategory } from "@/types";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrencySymbol, formatCurrency } from "@/utils/currency";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
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

const Expenses = () => {
  const { expenses, totalExpenseAmount, isLoading, categories, addCategory } = useExpenses();
  const { user, profile } = useAuth();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  
  const filteredExpenses = activeFilter === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === activeFilter);
    
  // Get user currency and format total amount
  const userCurrency = profile?.default_currency || "INR";
  // const userCurrency = "INR";
  const formattedTotalAmount = formatCurrency(totalExpenseAmount, userCurrency);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      setAddingCategory(true);
      try {
        await addCategory(newCategory.trim());
        setNewCategory('');
      } catch (error) {
        console.error("Error adding category:", error);
      } finally {
        setAddingCategory(false);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center backdrop-blur-sm bg-background/50 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">Sign in to view your expenses</h2>
        <p className="text-muted-foreground">You need to be signed in to see your expenses.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-screen-2xl relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Expense Tracker</h1>
          <p className="text-muted-foreground">Manage your personal and group expenses</p>
          <p className="text-blue font-medium mt-2">Total Expenses: {formattedTotalAmount}</p>
        </div>
        
        <Button 
          onClick={() => setAddExpenseOpen(true)}
          className="mt-4 lg:mt-0 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>
      
      {/* Category Filters */}
      <div className="mb-8 backdrop-blur-sm bg-background/50 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Category</span>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Category</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter a name for your new expense category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setNewCategory('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategory.trim()}
                >
                  {addingCategory ? "Adding..." : "Add Category"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            key="All"
            variant={activeFilter === 'All' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter('All')}
            className="rounded-full px-4"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(category)}
              className="rounded-full px-4"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 backdrop-blur-sm bg-background/50 rounded-xl">
            <p className="text-muted-foreground">No expenses found. Add some expenses to get started.</p>
          </div>
        )}
      </div>
      
      <AddExpenseModal open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
    </div>
  );
};

export default Expenses;
