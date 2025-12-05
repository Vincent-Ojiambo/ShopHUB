import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Truck } from "lucide-react";

interface OrderTrackingManagerProps {
  orderId: string;
  onUpdate?: () => void;
}

const statusOptions = [
  { value: "pending", label: "Order Placed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

export const OrderTrackingManager = ({ orderId, onUpdate }: OrderTrackingManagerProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a status",
      });
      return;
    }

    setLoading(true);
    try {
      // Add tracking event
      const { error: trackingError } = await supabase
        .from("order_tracking" as any)
        .insert({
          order_id: orderId,
          status: formData.status,
          description: formData.description || null,
          location: formData.location || null,
        });

      if (trackingError) throw trackingError;

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: formData.status })
        .eq("id", orderId);

      if (orderError) throw orderError;

      toast({
        title: "Success",
        description: "Tracking update added successfully",
      });

      setFormData({ status: "", description: "", location: "" });
      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error adding tracking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add tracking update",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck className="h-4 w-4 mr-2" />
          Add Tracking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tracking Update</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., Package has been picked up by courier"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Nairobi Sorting Facility"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
