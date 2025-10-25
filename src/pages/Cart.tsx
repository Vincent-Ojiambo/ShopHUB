import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 159.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
    },
    {
      id: "2",
      name: "Smart Watch Series 7",
      price: 299.99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80",
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

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
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="text-lg font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-border min-w-[60px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">
                        {shipping === 0 ? (
                          <span className="text-accent">Free</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    {shipping > 0 && (
                      <div className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg">
                        Add ${(50 - subtotal).toFixed(2)} more for free shipping
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Tag className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary mb-3"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Link to="/products">
                    <Button variant="outline" size="lg" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
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