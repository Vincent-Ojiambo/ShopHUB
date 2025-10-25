import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About ShopHub</h3>
            <p className="text-sm text-secondary-foreground/80">
              Your trusted marketplace for quality products at great prices. Shop with confidence.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Stay Connected</h3>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Subscribe to get special offers and updates
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-md bg-background text-foreground text-sm"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};