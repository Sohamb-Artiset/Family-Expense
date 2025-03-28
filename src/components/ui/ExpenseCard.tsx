
import React, { useState } from "react";
import { MoreVertical, Receipt, Trash, Edit } from "lucide-react";
import { Expense } from "@/types";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/contexts/ExpenseContext";
import { formatCurrency, getCurrencySymbol } from "@/utils/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditExpenseModal from "@/components/modals/EditExpenseModal";

interface ExpenseCardProps {
  expense: Expense;
}

const CategoryIcon = ({ category }: { category: string }) => {
  const getIconStyles = () => {
    switch (category) {
      case 'Food':
        return 'bg-category-food';
      case 'Rent':
        return 'bg-category-rent';
      case 'Travel':
        return 'bg-category-travel';
      case 'Shopping':
        return 'bg-category-shopping';
      default:
        return 'bg-category-other';
    }
  };

  return (
    <div className={cn("expense-category-icon", getIconStyles())}>
      <Receipt className="w-5 h-5" />
    </div>
  );
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const { deleteExpense } = useExpenses();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const handleDelete = () => {
    // Call the deleteExpense function
    deleteExpense(expense.id);
    // Close the dropdown menu after deletion
    setIsMenuOpen(false);
  };
  
  const handleEdit = () => {
    // Open the edit modal
    setEditModalOpen(true);
    // Close the dropdown menu
    setIsMenuOpen(false);
  };

  // Format the amount with the appropriate currency symbol
  const formattedAmount = formatCurrency(expense.amount, expense.currency);
  
  return (
    <>
      <div className="glass-card rounded-xl p-4 expense-card-hover animate-fade-in-up">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <CategoryIcon category={expense.category} />
            <div>
              <h3 className="font-medium text-foreground">{expense.title}</h3>
              <div className="text-xs text-muted-foreground">{expense.date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formattedAmount}</span>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <span className="bg-secondary text-xs px-2 py-1 rounded-md text-muted-foreground">
            {expense.category}
          </span>
          {expense.currency && expense.currency !== "USD" && (
            <span className="bg-blue/10 text-xs px-2 py-1 rounded-md text-blue">
              {expense.currency}
            </span>
          )}
          {expense.group && (
            <span className="bg-blue/10 text-xs px-2 py-1 rounded-md text-blue">
              {expense.group}
            </span>
          )}
        </div>
      </div>
      
      {/* Edit Expense Modal */}
      <EditExpenseModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        expense={expense}
      />
    </>
  );
};

export default ExpenseCard;
