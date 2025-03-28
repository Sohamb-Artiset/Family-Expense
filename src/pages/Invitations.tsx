import React, { useEffect } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import InvitationCard from "@/components/ui/InvitationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const Invitations = () => {
  const { pendingInvitations, invitationsLoading, fetchInvitations } = useExpenses();
  const { user } = useAuth();
  
  useEffect(() => {
    // Refresh invitations when the component mounts
    if (user) {
      fetchInvitations();
    }
  }, [user]);
  
  if (invitationsLoading) {
    return (
      <div className="container mx-auto py-8 max-w-screen-xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="glass-card rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 mt-3 mb-3" />
              <div className="flex justify-end space-x-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center backdrop-blur-sm bg-background/50 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">Sign in to view your invitations</h2>
        <p className="text-muted-foreground">You need to be signed in to see your invitations.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 flex items-center">
          <Bell className="inline-block mr-2 h-6 w-6" /> Group Invitations
        </h1>
        <p className="text-muted-foreground">
          Manage invitations to join expense sharing groups
        </p>
      </div>
      
      {pendingInvitations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingInvitations.map(invitation => (
            <InvitationCard 
              key={invitation.id} 
              invitation={invitation} 
            />
          ))}
        </div>
      ) : (
        <div className={cn("glass-card rounded-xl p-8 text-center", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Pending Invitations</h3>
          <p className="text-muted-foreground">
            You don't have any pending group invitations at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default Invitations; 