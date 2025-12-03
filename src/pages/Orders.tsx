import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, Truck, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

type OrderWithItems = Order & {
  items: OrderItem[];
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems: OrderWithItems[] = [];

      for (const order of ordersData || []) {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        ordersWithItems.push({
          ...order,
          items: items || [],
        });
      }

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-primary to-primary-light">
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <span className="font-semibold">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status || "pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on{" "}
                      {new Date(order.created_at || "").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${order.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{order.items.length - 3} more item(s)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payment: </span>
                    <span className="font-medium capitalize">
                      {order.payment_method?.replace("_", " ")}
                    </span>
                    {order.payment_status && (
                      <Badge variant="outline" className="ml-2">
                        {order.payment_status}
                      </Badge>
                    )}
                  </div>
                  <Link to={`/order-confirmation/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
