import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroBanner from "@/assets/hero-banner.jpg";
import electronicsCategory from "@/assets/electronics-category.jpg";
import fashionCategory from "@/assets/fashion-category.jpg";
import homeCategory from "@/assets/home-category.jpg";

type Product = Tables<"products">;

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(8);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const categories = [
    {
      name: "Electronics",
      image: electronicsCategory,
      itemCount: 1250,
      href: "/products?category=electronics",
    },
    {
      name: "Fashion",
      image: fashionCategory,
      itemCount: 3400,
      href: "/products?category=fashion",
    },
    {
      name: "Home & Living",
      image: homeCategory,
      itemCount: 890,
      href: "/products?category=home",
    },
  ];

  const features = [
    {
      icon: Truck,
      title: "Free Delivery",
      description: "On orders over $50",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "100% secure transactions",
    },
    {
      icon: CreditCard,
      title: "Easy Returns",
      description: "30-day return policy",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated customer service",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[600px] overflow-hidden">
          <img
            src={heroBanner}
            alt="Shop the latest products"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/50" />
          <div className="absolute inset-0 container mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Discover Amazing Deals
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Shop the latest products from top brands at unbeatable prices
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-lg px-8">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-y border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
                <p className="text-muted-foreground">Explore our wide range of products</p>
              </div>
              <Link to="/products">
                <Button variant="outline">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Best deals handpicked for you</p>
              </div>
              <Link to="/products">
                <Button variant="outline">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
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
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary-light">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Newsletter
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Get exclusive offers, new product alerts, and insider deals delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
              />
              <Button size="lg" variant="secondary" className="px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;