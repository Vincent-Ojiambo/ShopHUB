import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Package, Truck, CreditCard, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderTracking } from "@/components/OrderTracking";

type OrderWithItems = Tables<"orders"> & {
  items: Tables<"order_items">[];
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!orderId) {
      navigate("/");
      return;
    }
    fetchOrder();
  }, [user, orderId]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      setOrder({
        ...orderData,
        items: itemsData || [],
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentMethodDisplay = (method: string | null) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "paypal":
        return "PayPal";
      case "cash_on_delivery":
        return "Cash on Delivery";
      default:
        return method || "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-96 mb-8 mx-auto" />
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Order not found</div>
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
          {/* Success Header */}
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you shipping confirmation when your order ships.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Info Summary */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Order Number</span>
                  </div>
                  <p className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Order Date</span>
                  </div>
                  <p className="text-sm">{formatDate(order.created_at || "")}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm font-medium">Order Status</span>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
              </div>

              {order.tracking_number && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm font-medium">Tracking Number</span>
                  </div>
                  <p className="font-mono text-lg font-semibold">{order.tracking_number}</p>
                </div>
              )}
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.product_price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>
                    ${order.items.reduce((sum, item) => sum + Number(item.subtotal), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">Shipping Address</h3>
                </div>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {order.shipping_address}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">Payment Method</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getPaymentMethodDisplay(order.payment_method)}
                </p>
                <div className="mt-4">
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    {order.payment_status?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Order Tracking */}
            <OrderTracking orderId={order.id} currentStatus={order.status} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/products">
                <Button variant="outline" size="lg">
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
