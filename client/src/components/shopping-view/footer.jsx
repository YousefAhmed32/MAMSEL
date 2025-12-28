import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, Heart, Sparkles, MessageCircle } from "lucide-react";

const handleYansyClick = () => {
  window.open('https://wa.me/201090385390', '_blank');
};

function Footer() {
  return (
    <footer className="relative bg-white dark:bg-[#0f0f0f] text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">

        {/* ====== Grid Sections ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">

          {/* === Logo & About === */}
          <div className="space-y-6">
            <Link to="/shop/home" className="flex items-center gap-3 group transition-all duration-300">
              <div className="w-[140px] h-12 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/assets/mamsal-logo1.png"
                  alt="Designer Store"
                  className="w-full h-full object-cover"
                />
              </div>
             
            </Link>

            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-xs">
              Discover luxury designer clothing curated with elegance and sophistication.
            </p>

            <div className="flex gap-3 pt-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/oud_alwajba?igsh=ZnJ0M3UwYXM5b2E2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 transition-colors duration-300" />
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/97451227772"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* === Quick Links === */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif font-semibold text-base mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/shop/home", label: "Home" },
                { to: "/shop/listing", label: "All Products" },
                { to: "/shop/account", label: "My Account" },
                { to: "/shop/checkout", label: "Checkout" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === Categories === */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif font-semibold text-base mb-6">
              Categories
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/shop/listing?category=men", label: "Men's Collection" },
                { to: "/shop/listing?category=women", label: "Women's Collection" },
                { to: "/shop/listing?category=unisex", label: "Unisex" },
                { to: "/shop/listing?category=luxury", label: "Luxury Collection" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === Contact Info === */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif font-semibold text-base mb-6">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <a
                  href="https://wa.me/97451227772"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300"
                >
                  <Phone className="w-4 h-4" />
                  <span>+97451227772</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300">
                <Mail className="w-4 h-4" />
                <span>info@designerstore.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Qatar, Doha</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ====== Bottom Section ====== */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} MAMSEL. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Developed by</span>
            <a
              href="https://wa.me/201090385390"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:text-[#E5C158] transition-colors duration-300 font-medium"
            >
              YANSY
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
