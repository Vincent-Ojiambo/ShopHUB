import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

type Product = Tables<"products">;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate("/products");
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (product) {
      await addToCart(product.id, quantity);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (product) {
      await toggleWishlist(product.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [product.image_url || ""];
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border border-border">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.badge && (
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full mb-2">
                  {product.badge}
                </span>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.rating} ({product.reviews_count} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">${product.price}</span>
                {product.original_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.original_price}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded">
                      Save{" "}
                      {Math.round(
                        ((product.original_price - product.price) / product.original_price) * 100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-border">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-muted"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock} items in stock
              </span>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>

            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Free delivery on orders over $50</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm">1 year warranty included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-6">
            <p className="text-muted-foreground">{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="py-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">General</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Brand</dt>
                    <dd className="font-medium">Premium Brand</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Model</dt>
                    <dd className="font-medium">{product.slug}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <p className="text-muted-foreground">
              {product.reviews_count} customer reviews. Average rating: {product.rating}/5
            </p>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
