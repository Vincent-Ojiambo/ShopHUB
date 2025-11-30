import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);

    if (!error && data) {
      const total = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(total);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to add items to your cart",
      });
      return false;
    }

    try {
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: (existing.quantity || 0) + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });

        if (error) throw error;
      }

      await fetchCartCount();
      
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart",
      });
      return false;
    }
  };

  return { cartCount, addToCart, refreshCart: fetchCartCount };
};
