import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      toast({
        title: "Subscribed Successfully",
        description: "Thank you for subscribing to our newsletter"
      });
    }, 1000);
  };

  return (
    <footer className="relative bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-1">
            <Link 
              to="/shop/home" 
              className="inline-block group transition-transform duration-300 hover:scale-105"
            >
              <div className="w-[140px] h-auto overflow-hidden flex items-center justify-center">
                <img
                  src="/assets/mamsal-logo1.png"
                  alt="Designer Store"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-xs font-light">
              Discover luxury designer clothing curated with elegance and sophistication for the modern connoisseur.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://www.instagram.com/oud_alwajba?igsh=ZnJ0M3UwYXM5b2E2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-900 hover:border-gray-900 hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-900 hover:border-gray-900 hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300 group"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-900 hover:border-gray-900 hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300 group"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-900 hover:border-gray-900 hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300 group"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif font-semibold text-base mb-6 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { to: "/shop/home", label: "Home" },
                { to: "/shop/listing", label: "Shop" },
                { to: "/shop/account", label: "My Account" },
                { to: "/shop/wishlist", label: "Wishlist" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 font-light inline-block hover:translate-x-1 transition-transform duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Support */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif font-semibold text-base mb-6 tracking-wide">
              About
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { to: "/shop/listing", label: "About Us" },
                { to: "/shop/listing", label: "Contact" },
                { to: "/shop/listing", label: "FAQ" },
                { to: "/shop/listing", label: "Shipping & Returns" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 font-light inline-block hover:translate-x-1 transition-transform duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif font-semibold text-base mb-6 tracking-wide">
              Newsletter
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-light leading-relaxed">
              Subscribe to receive updates on new collections and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-900 dark:focus:border-white focus:ring-0 rounded-sm text-sm font-light"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 border border-gray-900 dark:border-white rounded-sm px-4 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
            © {new Date().getFullYear()} Designer Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link 
              to="/shop/listing" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 font-light"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Link 
              to="/shop/listing" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 font-light"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
