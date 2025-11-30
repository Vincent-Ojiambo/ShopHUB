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
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCart();
  }, [user]);

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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
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
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Link to={`/product/${item.product.id}`}>
                        <img
                          src={item.product.image_url || ""}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-semibold hover:text-primary">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xl font-bold mt-2">
                          ${item.product.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-muted"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-border min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-muted"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-md"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-right text-muted-foreground">
                      Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-sm text-green-600">Free shipping applied!</p>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full mb-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Link to="/products">
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
