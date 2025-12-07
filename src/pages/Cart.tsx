import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowRight, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: Tables<"products">;
};

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCart();
  }, [user, authLoading]);

  const fetchCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      setCartItems(
        (data || [])
          .filter((item) => item.product !== null)
          .map((item) => ({
            id: item.id,
            quantity: item.quantity || 1,
            product: item.product as Tables<"products">,
          }))
      );
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cart items",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(
        cartItems.map((i) =>
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        )
      );
      
      await refreshCart();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(cartItems.filter((item) => item.id !== itemId));
      
      await refreshCart();
      
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item",
      });
    }
  };

  // Format number with commas
  const formatKES = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 5000 ? 0 : 1500; // Free shipping over KSh 5,000
  const tax = subtotal * 0.16; // 16% VAT in Kenya
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added anything to your cart yet
                </p>
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted/50">
                          <img
                            src={item.product.image_url || ""}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      </Link>
                      
                      {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-4">
                          <Link to={`/product/${item.product.id}`} className="flex-1 group">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {formatKES(item.product.price)} each
                            </p>
                          </Link>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault();
                              removeItem(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border rounded-md overflow-hidden bg-muted/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-none hover:bg-muted"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-none hover:bg-muted"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-semibold text-foreground">
                              {formatKES(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="p-4 sm:p-6 h-fit sticky top-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatKES(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : formatKES(shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatKES(tax)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3 flex justify-between font-bold text-base sm:text-lg">
                      <span>Total</span>
                      <span>{formatKES(total)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-primary to-primary-light">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Link to="/products" className="block mt-2">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>

                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4" />
                      <span className="font-semibold">Have a promo code?</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 rounded-md border bg-background"
                      />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
