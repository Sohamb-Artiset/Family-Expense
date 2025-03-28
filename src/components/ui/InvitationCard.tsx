import React from "react";
import { GroupInvitation } from "@/contexts/ExpenseContext";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users } from "lucide-react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { cn } from "@/lib/utils";

interface InvitationCardProps {
  invitation: GroupInvitation;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ invitation }) => {
  const { acceptInvitation, rejectInvitation } = useExpenses();
  
  const handleAccept = () => {
    acceptInvitation(invitation.id);
  };
  
  const handleReject = () => {
    rejectInvitation(invitation.id);
  };
  
  return (
    <div className={cn("glass-card rounded-xl p-4 shadow-sm", "dark:bg-opacity-70 dark:backdrop-blur-lg")}>
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{invitation.groupName}</h3>
            <p className="text-muted-foreground text-sm">
              Invited by: {invitation.inviterName}
            </p>
          </div>
          <div className="bg-blue/10 p-2 rounded-full">
            <Users className="h-5 w-5 text-blue" />
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Invited on {invitation.createdAt}</span>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvitationCard; 