import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackingEvent {
  id: string;
  status: string;
  description: string | null;
  location: string | null;
  created_at: string;
}

interface OrderTrackingProps {
  orderId: string;
  currentStatus: string | null;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export const OrderTracking = ({ orderId, currentStatus }: OrderTrackingProps) => {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingEvents();
  }, [orderId]);

  const fetchTrackingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("order_tracking" as any)
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrackingEvents((data as unknown as TrackingEvent[]) || []);
    } catch (error) {
      console.error("Error fetching tracking events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    const index = statusSteps.findIndex((step) => step.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Order Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Progress Bar */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center flex-1 ${
                    index < statusSteps.length - 1 ? "relative" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  
                  {/* Connector line */}
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-0.5 ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                      style={{ transform: "translateX(50%)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking Events Timeline */}
        {trackingEvents.length > 0 ? (
          <div className="mt-6">
            <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
              Tracking History
            </h4>
            <div className="space-y-4">
              {trackingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`relative pl-6 pb-4 ${
                    index !== trackingEvents.length - 1
                      ? "border-l-2 border-muted ml-2"
                      : "ml-2"
                  }`}
                >
                  <div
                    className={`absolute -left-2 w-4 h-4 rounded-full ${
                      index === 0 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <div className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {event.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-foreground mt-2">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tracking updates yet</p>
            <p className="text-xs">Updates will appear here once your order ships</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
