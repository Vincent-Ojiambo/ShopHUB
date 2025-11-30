import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistCount(0);
      setWishlistItems(new Set());
      return;
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setWishlistCount(data.length);
      setWishlistItems(new Set(data.map(item => item.product_id || '')));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to save items to your wishlist",
      });
      return false;
    }

    try {
      const isInWishlist = wishlistItems.has(productId);

      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        toast({
          title: "Removed from Wishlist",
          description: "Item has been removed from your wishlist",
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist_items')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;

        toast({
          title: "Added to Wishlist",
          description: "Item has been added to your wishlist",
        });
      }

      await fetchWishlist();
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update wishlist",
      });
      return false;
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.has(productId);

  return { wishlistCount, toggleWishlist, isInWishlist, refreshWishlist: fetchWishlist };
};
