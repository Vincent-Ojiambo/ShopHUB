import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

type Product = Tables<"products">;

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFilter);
  const [sortBy, setSortBy] = useState("featured");

  const categories = [
    { name: "All Categories", slug: null },
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home & Living", slug: "home" },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*");

      // Apply category filter
      if (selectedCategory) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategory)
          .single();
        
        if (categoryData) {
          query = query.eq("category_id", categoryData.id);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "featured":
        default:
          query = query.order("is_featured", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Apply price filter client-side
      const filtered = (data || []).filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );
      
      setProducts(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [priceRange]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.slug || "all"} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.slug}
                      onChange={() => setSelectedCategory(category.slug)}
                      className="rounded"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Price Range</h3>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={2000}
                step={10}
                className="mb-2"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name
                  : "All Products"}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {products.length} products
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm bg-background"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.original_price || undefined}
                    rating={product.rating || 0}
                    reviews={product.reviews_count || 0}
                    image={product.image_url || ""}
                    badge={product.badge || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
