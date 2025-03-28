import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseCategory } from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useExpenses } from "@/contexts/ExpenseContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGroup?: string;
}

const CURRENCIES = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
  { value: "BRL", label: "Brazilian Real (R$)" },
  { value: "MXN", label: "Mexican Peso (MX$)" },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  group: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
});

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  open, 
  onOpenChange,
  defaultGroup 
}) => {
  const { addExpense, groups, categories, addCategory } = useExpenses();
  const { user, profile } = useAuth();
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: categories.length > 0 ? categories[0] : "Food",
      group: defaultGroup || "",
      currency: profile?.default_currency || "INR",
    },
  });

  useEffect(() => {
    if (categories.length > 0 && !form.getValues().category) {
      form.setValue("category", categories[0]);
    }
  }, [categories, form]);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      setAddingCategory(true);
      try {
        await addCategory(newCategory.trim());
        form.setValue("category", newCategory.trim());
        setNewCategory("");
        setShowNewCategoryInput(false);
        toast({
          title: "Category added",
          description: `New category "${newCategory.trim()}" has been added`,
        });
      } catch (error) {
        console.error("Error adding category:", error);
        toast({
          title: "Error",
          description: "Failed to add category",
          variant: "destructive",
        });
      } finally {
        setAddingCategory(false);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to add expenses",
          variant: "destructive",
        });
        return;
      }

      const expenseDate = new Date();
      const formattedDate = expenseDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });

      const expenseData = {
        title: values.title,
        amount: values.amount,
        category: values.category,
        currency: values.currency,
        date: expenseDate.toISOString().split('T')[0],
        user_id: user.id,
        group_id: values.group && values.group !== "none" ? 
          groups.find(g => g.name === values.group)?.id : null
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (error) {
        console.error("Error saving expense:", error);
        throw error;
      }

      addExpense({
        title: values.title,
        amount: values.amount,
        category: values.category,
        currency: values.currency,
        date: formattedDate,
        group: values.group !== "none" ? values.group : undefined,
      });
      
      form.reset();
      onOpenChange(false);
      
      toast({
        title: "Expense added",
        description: `${values.currency} ${values.amount.toFixed(2)} for ${values.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>Fill out the details for your new expense.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Expense title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex space-x-2">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Popover open={showNewCategoryInput} onOpenChange={setShowNewCategoryInput}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          type="button"
                          onClick={() => setShowNewCategoryInput(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="flex flex-col space-y-2">
                          <h4 className="font-medium">Add New Category</h4>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Category name"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <Button 
                              size="sm" 
                              onClick={handleAddCategory}
                              disabled={addingCategory || !newCategory.trim()}
                              type="button"
                            >
                              {addingCategory ? "..." : "Add"}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Group</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Expense</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
