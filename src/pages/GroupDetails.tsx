import { ArrowLeft, Plus, Settings, Trash, UserPlus } from "lucide-react";

<div className="flex flex-wrap gap-2 mt-4">
  {currentGroup?.created_by === user?.id && (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => navigate(`/groups/${groupId}/settings`)}
      >
        <Settings className="h-4 w-4" /> Settings
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => navigate(`/groups/${groupId}/add-members`)}
      >
        <UserPlus className="h-4 w-4" /> Add Members
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 text-destructive"
        onClick={handleDeleteGroup}
      >
        <Trash className="h-4 w-4" /> Delete
      </Button>
    </>
  )}
</div> 