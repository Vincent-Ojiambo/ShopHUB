import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const Products = () => {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const products = [
    {
      id: "1",
      name: "Premium Wireless Headphones with Noise Cancellation",
      price: 159.99,
      originalPrice: 199.99,
      rating: 4.5,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      badge: "Best Seller",
    },
    {
      id: "2",
      name: "Smart Watch Series 7 with Fitness Tracking",
      price: 299.99,
      originalPrice: 399.99,
      rating: 4.8,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      badge: "Hot Deal",
    },
    {
      id: "3",
      name: "Professional Camera Kit with Lenses",
      price: 1299.99,
      rating: 4.9,
      reviews: 123,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
    },
    {
      id: "4",
      name: "Designer Leather Handbag Collection",
      price: 189.99,
      originalPrice: 249.99,
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80",
    },
    {
      id: "5",
      name: "Ultra HD 4K Smart Television 55 inch",
      price: 699.99,
      originalPrice: 899.99,
      rating: 4.7,
      reviews: 456,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
      badge: "New Arrival",
    },
    {
      id: "6",
      name: "Ergonomic Gaming Chair with RGB Lighting",
      price: 349.99,
      rating: 4.4,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&q=80",
    },
    {
      id: "7",
      name: "Portable Bluetooth Speaker Waterproof",
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.5,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
    },
    {
      id: "8",
      name: "Mechanical Keyboard RGB Backlit",
      price: 129.99,
      rating: 4.6,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80",
    },
    {
      id: "9",
      name: "Wireless Gaming Mouse Ergonomic",
      price: 89.99,
      rating: 4.7,
      reviews: 445,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
    },
    {
      id: "10",
      name: "USB-C Hub Multiport Adapter",
      price: 49.99,
      rating: 4.3,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&q=80",
    },
    {
      id: "11",
      name: "Laptop Stand Aluminum Adjustable",
      price: 39.99,
      rating: 4.5,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
    },
    {
      id: "12",
      name: "Webcam HD 1080p for Streaming",
      price: 119.99,
      originalPrice: 149.99,
      rating: 4.6,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&q=80",
    },
  ];

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Living",
    "Beauty",
    "Sports",
    "Books",
    "Toys",
    "Automotive",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Filters</h2>
                    <Button variant="ghost" size="sm">
                      Clear All
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                        >
                          <Checkbox />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <Slider
                      defaultValue={[0, 1000]}
                      max={2000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div>
                    <h3 className="font-semibold mb-3">Rating</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <label
                          key={rating}
                          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                        >
                          <Checkbox />
                          <span className="text-sm">{rating}★ & above</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">All Products</h1>
                  <p className="text-muted-foreground">
                    Showing {products.length} products
                  </p>
                </div>
                <select className="px-4 py-2 border border-border rounded-lg bg-card text-sm">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Rating</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={page === 1 ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;