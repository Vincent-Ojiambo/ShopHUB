import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Review = Tables<"reviews"> & {
  profile_name?: string | null;
};

interface ProductReviewsProps {
  productId: string;
  onReviewAdded?: () => void;
}

export const ProductReviews = ({ productId, onReviewAdded }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile names for each review
      const reviewsWithNames: Review[] = [];
      for (const review of data || []) {
        let profileName = null;
        if (review.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", review.user_id)
            .maybeSingle();
          profileName = profile?.full_name;
        }
        reviewsWithNames.push({ ...review, profile_name: profileName });
      }

      setReviews(reviewsWithNames);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to leave a review",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });

      setComment("");
      setRating(5);
      fetchReviews();
      onReviewAdded?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit review",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= (interactive ? hoveredStar || count : count)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Form */}
      {user && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              {renderStars(rating, true)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Review (optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          Customer Reviews ({reviews.length})
        </h3>

        {loading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {review.profile_name || "Anonymous"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                  {renderStars(review.rating)}
                  {review.comment && (
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
