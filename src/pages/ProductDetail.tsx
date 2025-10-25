import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: "1",
    name: "Premium Wireless Headphones with Noise Cancellation",
    price: 159.99,
    originalPrice: 199.99,
    rating: 4.5,
    reviews: 234,
    inStock: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&q=80",
    ],
    description:
      "Experience crystal-clear audio with our premium wireless headphones. Featuring advanced noise cancellation technology, these headphones deliver an immersive listening experience. With up to 30 hours of battery life and quick charging capabilities, they're perfect for travel, work, or leisure.",
    features: [
      "Active Noise Cancellation (ANC)",
      "30-hour battery life",
      "Quick charge: 10 minutes = 5 hours",
      "Premium audio drivers",
      "Bluetooth 5.0 connectivity",
      "Comfortable over-ear design",
      "Foldable and portable",
      "Built-in microphone for calls",
    ],
    specifications: {
      Brand: "AudioPro",
      Model: "AP-X5000",
      Color: "Black",
      Weight: "250g",
      Connectivity: "Bluetooth 5.0, 3.5mm jack",
      BatteryLife: "30 hours",
      ChargingTime: "2 hours",
    },
  };

  const reviews = [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      date: "2024-01-15",
      comment:
        "Absolutely amazing headphones! The noise cancellation is incredible and the battery life is even better than advertised.",
      helpful: 24,
    },
    {
      id: 2,
      author: "Sarah Smith",
      rating: 4,
      date: "2024-01-10",
      comment:
        "Great sound quality and very comfortable. Only minor issue is they can feel a bit tight after wearing for several hours.",
      helpful: 18,
    },
    {
      id: 3,
      author: "Mike Johnson",
      rating: 5,
      date: "2024-01-05",
      comment:
        "Perfect for my daily commute. The noise cancellation blocks out all the subway noise. Highly recommend!",
      helpful: 31,
    },
  ];

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/products" className="text-muted-foreground hover:text-primary">
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">Electronics</span>
          </div>

          <Link to="/products" className="inline-flex items-center gap-2 text-sm mb-6 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-destructive text-destructive-foreground text-sm font-medium rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">In Stock - Ships within 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">Free delivery on orders over $50</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
                <Button className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <Button variant="secondary" size="lg" className="w-full">
                Buy Now
              </Button>
            </div>
          </div>

          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Reviews ({product.reviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground mb-6">{product.description}</p>
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;