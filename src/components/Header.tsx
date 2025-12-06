import { Search, ShoppingCart, User, Heart, Menu, LogOut, Package, Settings, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useSearch } from "@/hooks/use-search";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { results, loading, search, clearResults } = useSearch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      search(query);
      setShowResults(true);
    } else {
      clearResults();
      setShowResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setSearchQuery("");
    clearResults();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary-foreground/10 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/ShopHub.png" 
              alt="ShopHub Logo" 
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products, brands, and categories..."
                  className="pl-10 pr-4 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => results.length > 0 && setShowResults(true)}
                />
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (searchQuery.trim() || results.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No products found for "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product.id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                      >
                        <img
                          src={product.image_url || ""}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-primary font-semibold">${product.price}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full p-3 text-center text-primary font-medium hover:bg-muted transition-colors border-t border-border"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </>
                )}
              </div>
            )}
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
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    My Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Cart
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <div className="flex items-center">
                    <img 
                      src="/ShopHub.png" 
                      alt="ShopHub Logo" 
                      className="h-20 w-auto object-contain"
                    />
                  </div>
                </SheetHeader>
                <div className="flex flex-col py-4">
                  {user ? (
                    <div className="px-4 py-3 border-b border-border mb-2">
                      <p className="text-sm text-muted-foreground">Welcome,</p>
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                  ) : (
                    <div className="px-4 pb-4 border-b border-border mb-2 flex flex-col gap-2">
                      <Link to="/auth">
                        <Button className="w-full" size="sm">Sign In</Button>
                      </Link>
                      <Link to="/auth">
                        <Button variant="outline" className="w-full" size="sm">Register</Button>
                      </Link>
                    </div>
                  )}
                  
                  <nav className="flex flex-col">
                    <Link to="/products?category=electronics" className="px-4 py-3 hover:bg-muted transition-colors">
                      Electronics
                    </Link>
                    <Link to="/products?category=fashion" className="px-4 py-3 hover:bg-muted transition-colors">
                      Fashion
                    </Link>
                    <Link to="/products?category=home" className="px-4 py-3 hover:bg-muted transition-colors">
                      Home & Living
                    </Link>
                    <Link to="/products?category=beauty" className="px-4 py-3 hover:bg-muted transition-colors">
                      Beauty
                    </Link>
                    <Link to="/products?category=sports" className="px-4 py-3 hover:bg-muted transition-colors">
                      Sports
                    </Link>
                    <Link to="/products" className="px-4 py-3 text-accent font-medium hover:bg-muted transition-colors">
                      View All Categories
                    </Link>
                  </nav>

                  <div className="border-t border-border mt-2 pt-2">
                    {user && (
                      <>
                        {isAdmin && (
                          <Link to="/admin" className="px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-primary font-medium">
                            <Shield className="h-5 w-5" />
                            Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" className="px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors">
                          <Settings className="h-5 w-5" />
                          My Profile
                        </Link>
                        <Link to="/orders" className="px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors">
                          <Package className="h-5 w-5" />
                          My Orders
                        </Link>
                      </>
                    )}
                    <Link to="/wishlist" className="px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors">
                      <Heart className="h-5 w-5" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/cart" className="px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors">
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {user && (
                    <div className="border-t border-border mt-2 pt-2">
                      <button 
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left text-destructive"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
