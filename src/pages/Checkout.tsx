import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreditCard, Truck, Wallet, ShoppingBag } from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
  paymentMethod: z.enum(["credit_card", "paypal", "cash_on_delivery"]),
});

type AddressForm = z.infer<typeof addressSchema>;

type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: Tables<"products">;
};

const Checkout = () => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      paymentMethod: "credit_card",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCart();
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, address, city, country")
        .eq("id", user.id)
        .single();

      if (data) {
        form.reset({
          fullName: data.full_name || "",
          address: data.address || "",
          city: data.city || "",
          state: data.country || "",
          zipCode: "",
          phone: data.phone || "",
          paymentMethod: "credit_card",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      const items = (data || [])
        .filter((item) => item.product !== null)
        .map((item) => ({
          id: item.id,
          quantity: item.quantity || 1,
          product: item.product as Tables<"products">,
        }));

      if (items.length === 0) {
        navigate("/cart");
        return;
      }

      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cart items",
      });
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AddressForm) => {
    if (!user || cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const shipping = subtotal > 50 ? 0 : 9.99;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      const shippingAddress = `${data.fullName}\n${data.address}\n${data.city}, ${data.state} ${data.zipCode}\nPhone: ${data.phone}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: shippingAddress,
          payment_method: data.paymentMethod,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearError) throw clearError;

      await refreshCart();

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. We'll send you a confirmation email.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to place order. Please try again.",
      });
    } finally {
      setSubmitting(false);
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
          <div className="animate-pulse">Loading...</div>
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
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Truck className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold">Shipping Address</h2>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 234 567 8900" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Wallet className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold">Payment Method</h2>
                    </div>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                                  <CreditCard className="h-5 w-5" />
                                  <div>
                                    <div className="font-semibold">Credit Card</div>
                                    <div className="text-sm text-muted-foreground">Pay with credit or debit card</div>
                                  </div>
                                </Label>
                              </div>

                              <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                                  <Wallet className="h-5 w-5" />
                                  <div>
                                    <div className="font-semibold">PayPal</div>
                                    <div className="text-sm text-muted-foreground">Pay with your PayPal account</div>
                                  </div>
                                </Label>
                              </div>

                              <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                                <Label htmlFor="cash_on_delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                                  <ShoppingBag className="h-5 w-5" />
                                  <div>
                                    <div className="font-semibold">Cash on Delivery</div>
                                    <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-lg py-6"
                  >
                    {submitting ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 py-2 border-b border-border">
                      <img
                        src={item.product.image_url || ""}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
