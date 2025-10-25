import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const wishlistItems = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 159.99,
      originalPrice: 199.99,
      rating: 4.5,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    },
    {
      id: "3",
      name: "Professional Camera Kit",
      price: 1299.99,
      rating: 4.9,
      reviews: 123,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlistItems.length} items saved for later
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Find More Items
              </Button>
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save items you love by clicking the heart icon
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;