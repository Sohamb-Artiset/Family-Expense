
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GroupCard from "@/components/ui/GroupCard";
import CreateGroupModal from "@/components/modals/CreateGroupModal";
import EditGroupModal from "@/components/modals/EditGroupModal";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Group } from "@/types";

const Groups = () => {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { groups, groupsLoading } = useExpenses();
  const { user } = useAuth();
  
  // const userCurrency = profile?.default_currency || "INR";
  // const userCurrency = "INR";
  
  const filteredGroups = searchQuery && groups
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : groups;

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setEditGroupOpen(true);
  };

  const renderGroupsContent = () => {
    if (groupsLoading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="glass-card rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="mt-5">
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-2 w-full mb-6" />
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          </div>
        </div>
      ));
    }
    
    if (!user) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">Sign in to view and manage your groups.</p>
        </div>
      );
    }
    
    if (filteredGroups?.length > 0) {
      return filteredGroups.map((group) => (
        <GroupCard 
          key={group.id} 
          group={group} 
          onEdit={handleEditGroup}
        />
      ));
    }
    
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-muted-foreground">No groups found. Create your first group to get started.</p>
        <Button className="mt-4" onClick={() => setCreateGroupOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Group Expenses</h1>
          <p className="text-muted-foreground">Manage shared expenses with friends and family</p>
        </div>
        
        {user && (
          <Button 
            onClick={() => setCreateGroupOpen(true)}
            className="mt-4 lg:mt-0 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Group
          </Button>
        )}
      </div>
      
      {/* Search */}
      {user && (
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search groups..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      
      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderGroupsContent()}
      </div>
      
      <CreateGroupModal open={createGroupOpen} onOpenChange={setCreateGroupOpen} />
      <EditGroupModal 
        open={editGroupOpen} 
        onOpenChange={setEditGroupOpen} 
        group={selectedGroup} 
      />
    </div>
  );
};

export default Groups;
