import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, PieChart, DollarSign, Users, LayoutDashboard, LogOut, User, HelpCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { pathname } = useLocation();
  const { session, user, profile, signOut } = useAuth();
  const { pendingInvitations } = useExpenses();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Expenses", path: "/expenses", icon: DollarSign },
    { name: "Groups", path: "/groups", icon: Users },
    { name: "Analytics", path: "/analytics", icon: PieChart },
  ];

  const hasInvitations = pendingInvitations.length > 0;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!session && pathname !== "/dashboard" && pathname !== "/expenses" && pathname !== "/groups" && !pathname.includes("/groups/") && pathname !== "/analytics" && pathname !== "/profile") {
    return (
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Family Expense</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="default" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link to="/" className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline-block">Family Expense</span>
          </Link>

          {!isMobile && (
            <nav className="flex items-center space-x-1 ml-6">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 px-3",
                      isActive(item.path) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {session && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                onClick={() => navigate("/invitations")}
                aria-label="Invitations"
              >
                <Bell className="h-5 w-5" />
                {pendingInvitations.length > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1rem] h-4 flex items-center justify-center bg-blue text-white"
                  >
                    {pendingInvitations.length}
                  </Badge>
                )}
              </Button>
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "User"} />
                      <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || profile?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate("/help")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {isMobile && mobileMenuOpen && (
        <div className="container pb-3">
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive(item.path) && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
            <Link to="/invitations" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isActive("/invitations") && "bg-accent text-accent-foreground"
                )}
              >
                <Bell className="mr-2 h-4 w-4" />
                Invitations
                {hasInvitations && (
                  <Badge className="ml-2 bg-blue text-white">
                    {pendingInvitations.length}
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
