import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: ReactNode;
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'AD';
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen flex w-full bg-muted/30">
        {/* Sidebar */}
        <aside 
          className={cn(
            "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
            collapsed ? "w-[72px]" : "w-64"
          )}
        >
          {/* Logo/Brand */}
          <div className={cn(
            "h-16 flex items-center border-b border-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-foreground/20 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">Admin</span>
              </div>
            )}
            {collapsed && (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-foreground/20 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Search (only when expanded) */}
          {!collapsed && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const NavContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    collapsed && "justify-center px-2",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-foreground")} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return NavContent;
            })}
          </nav>

          <Separator />

          {/* User Profile Section */}
          <div className={cn("p-3", collapsed && "flex flex-col items-center")}>
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer",
              collapsed && "justify-center p-2"
            )}>
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profile?.full_name || 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Bottom Actions */}
          <div className={cn("p-3 space-y-1", collapsed && "flex flex-col items-center")}>
            {collapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/" 
                      className="flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Back to Store</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={signOut}
                      className="flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign Out</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Store</span>
                </Link>
                <button 
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            )}
          </div>

          {/* Collapse Toggle */}
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full justify-center text-muted-foreground hover:text-foreground",
                !collapsed && "justify-start"
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-foreground/20 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <nav className="flex gap-1 px-4 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Top bar (desktop) */}
          <header className="hidden md:flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {navItems.find(item => item.href === location.pathname)?.label || 'Admin'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </div>
          </header>
          
          <div className="p-6 md:p-8 mt-28 md:mt-0">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};
