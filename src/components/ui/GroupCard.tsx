import React, { useState, useContext } from "react";
import { MoreVertical, Users, Edit, Trash2 } from "lucide-react";
import { Group } from "@/types";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useExpenses } from "@/contexts/ExpenseContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExpenseContext } from "@/contexts/ExpenseContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onEdit }) => {
  const { id, name, totalExpenses, budget, created, members } = group;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { deleteGroup, user } = useContext(ExpenseContext);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get user currency
  const userCurrency = profile?.default_currency || "INR";
  
  const percentage = (totalExpenses / budget) * 100;
  const isOverBudget = percentage > 100;
  
  const isCreator = user?.id === group.created_by;
  
  const handleCardClick = () => {
    navigate(`/groups/${id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(group);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCreator) {
      setDeleteAlertOpen(true);
    } else {
      toast({
        title: "Permission Denied",
        description: "Only the group creator can delete this group",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCreator) {
      toast({
        title: "Permission Denied",
        description: "Only the group creator can delete this group",
        variant: "destructive",
      });
      setDeleteAlertOpen(false);
      return;
    }
    
    setIsDeleting(true);
    await deleteGroup(id);
    setIsDeleting(false);
    setDeleteAlertOpen(false);
  };
  
  // Format currency values
  const formattedTotalExpenses = formatCurrency(totalExpenses, userCurrency);
  const formattedBudget = formatCurrency(budget, userCurrency);
  
  return (
    <>
      <div 
        className="glass-card rounded-xl p-5 animate-fade-in-up hover-scale cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="bg-blue rounded-full w-10 h-10 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{name}</h3>
              <div className="text-xs text-muted-foreground">Created {created}</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Total Expenses</span>
            <span className="font-semibold">{formattedTotalExpenses}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Budget Usage</span>
            <span className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-blue'}`}>
              {formattedTotalExpenses} / {formattedBudget}
            </span>
          </div>
          
          <div className="progress-bar mt-1">
            <div 
              className={`progress-value ${isOverBudget ? 'bg-destructive' : ''}`} 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="mt-5">
            <div className="text-sm text-muted-foreground mb-2">Members <span className="text-foreground">{members.length}</span></div>
            <div className="flex flex-wrap gap-1">
              {members.map((member, index) => (
                <div key={index} className="bg-secondary px-2 py-1 rounded text-xs font-medium">
                  {member}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All expenses in this group will remain but will no longer be associated with this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isDeleting} 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Group"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GroupCard;
