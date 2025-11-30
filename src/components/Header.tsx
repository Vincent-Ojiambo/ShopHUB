import { Search, ShoppingCart, User, Heart, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <p>Welcome to our marketplace! Shop with confidence</p>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span>Welcome, {user.email}</span>
                <button onClick={handleSignOut} className="hover:underline flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hover:underline">Sign In</Link>
                <Link to="/auth" className="hover:underline">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              ShopHub
            </h1>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, and categories..."
                className="pl-10 pr-4 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    My Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    My Cart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="hidden md:flex relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Categories nav */}
        <nav className="hidden md:flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <Link to="/products?category=electronics" className="text-sm hover:text-primary transition-colors">
            Electronics
          </Link>
          <Link to="/products?category=fashion" className="text-sm hover:text-primary transition-colors">
            Fashion
          </Link>
          <Link to="/products?category=home" className="text-sm hover:text-primary transition-colors">
            Home & Living
          </Link>
          <Link to="/products?category=beauty" className="text-sm hover:text-primary transition-colors">
            Beauty
          </Link>
          <Link to="/products?category=sports" className="text-sm hover:text-primary transition-colors">
            Sports
          </Link>
          <Link to="/products" className="text-sm text-accent hover:text-accent/80 transition-colors font-medium">
            View All Categories
          </Link>
        </nav>
      </div>
    </header>
  );
};