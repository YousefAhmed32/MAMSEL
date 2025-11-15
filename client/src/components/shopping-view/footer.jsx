import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, Heart, Sparkles, MessageCircle } from "lucide-react";

const handleYansyClick = () => {
  window.open('https://wa.me/201090385390', '_blank');
};

function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-black via-zinc-950 to-black text-gray-300 border-t border-gold-500/30 overflow-hidden">
      {/* خلفية فخمة مع تأثيرات متحركة */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/95 via-black/95 to-zinc-950/95" />
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-gold-400/60 to-transparent blur-[3px] animate-pulse" />

      {/* تأثيرات إضاءة خفيفة */}
      <div className="absolute top-0 left-1/4 w-20 h-20 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-20 h-20 bg-gold-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative container mx-auto px-6 py-16">

        {/* ====== Grid Sections ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* === Logo & About === */}
          <div className="space-y-6">
            <Link to="/shop/home" className="flex items-center gap-3 group group-hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.4)] group-hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 group-hover:scale-110">
                  <img
                    src="/assets/logo2.png"
                    alt="عود الوجبة"
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent group-hover:from-gold-300 group-hover:via-gold-200 group-hover:to-gold-300 tracking-wider transition-all duration-300">
                عود الوجبة
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 max-w-xs hover:text-gray-300 transition-colors duration-300">
              اكتشف رفاهية العود الفاخر المختار بعناية — فالعود هو هوية تُعبّر عن ذوقك الرفيع.
            </p>


            <div className="flex gap-4 pt-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/oud_alwajba?igsh=ZnJ0M3UwYXM5b2E2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border-2 border-gold-500/30 rounded-full bg-black/30 backdrop-blur-sm hover:bg-gold-500/10 hover:border-gold-500/60 hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:scale-110 transition-all duration-300 cursor-pointer hover:text-pink-500 hover:border-pink-500/50"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gold-400 transition-colors duration-300" />
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/97451227772"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border-2 border-gold-500/30 rounded-full bg-black/30 backdrop-blur-sm hover:bg-gold-500/10 hover:border-gold-500/60 hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:scale-110 transition-all duration-300 cursor-pointer hover:text-green-400 hover:border-green-400/50"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-gold-400 transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* === Quick Links === */}
          <div>
            <h3 className="text-gold-400 font-bold text-lg mb-6 tracking-wide relative pb-3">
              <span className="relative z-10">روابط سريعة</span>
              <span className="absolute bottom-0 left-0 w-12 h-[2px] bg-gradient-to-r from-gold-500 to-transparent" />
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/shop/home", label: "الرئيسية" },
                { to: "/shop/listing", label: "جميع المنتجات" },
                { to: "/shop/account", label: "حسابي" },
                { to: "/shop/checkout", label: "الدفع" },
              ].map((item, idx) => (
                <li key={idx} className="group">
                  <Link
                    to={item.to}
                    className="flex items-center gap-2 text-gray-400 hover:text-gold-300 transition-all duration-300 group-hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 bg-gold-500/0 rounded-full group-hover:bg-gold-500 transition-all duration-300" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === Categories === */}
          <div>
            <h3 className="text-gold-400 font-bold text-lg mb-6 tracking-wide relative pb-3">
              <span className="relative z-10">الفئات</span>
              <span className="absolute bottom-0 left-0 w-12 h-[2px] bg-gradient-to-r from-gold-500 to-transparent" />
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/shop/listing?category=men", label: "عطور رجالية" },
                { to: "/shop/listing?category=women", label: "عطور نسائية" },
                { to: "/shop/listing?category=unisex", label: "للجنسين" },
                { to: "/shop/listing?category=luxury", label: "مجموعة فاخرة" },
              ].map((item, idx) => (
                <li key={idx} className="group">
                  <Link
                    to={item.to}
                    className="flex items-center gap-2 text-gray-400 hover:text-gold-300 transition-all duration-300 group-hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 bg-gold-500/0 rounded-full group-hover:bg-gold-500 transition-all duration-300" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === Contact Info === */}
          <div>
            <h3 className="text-gold-400 font-bold text-lg mb-6 tracking-wide relative pb-3">
              <span className="relative z-10">تواصل معنا</span>
              <span className="absolute bottom-0 left-0 w-12 h-[2px] bg-gradient-to-r from-gold-500 to-transparent" />
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3 group cursor-pointer">
                <a
                  href="https://wa.me/97451227772"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/20 group-hover:border-gold-500/50 group-hover:scale-110 transition-all duration-300">
                    <Phone className="w-4 h-4 text-gold-400 group-hover:text-gold-300 transition-colors" />
                  </div>
                  <span className="group-hover:text-gold-300 transition-colors">+97451227772</span>
                </a>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/20 group-hover:border-gold-500/50 group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-4 h-4 text-gold-400 group-hover:text-gold-300 transition-colors" />
                </div>
                <span className="group-hover:text-gold-300 transition-colors">info@oudalwajba.com</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/20 group-hover:border-gold-500/50 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-4 h-4 text-gold-400 group-hover:text-gold-300 transition-colors" />
                </div>
                <span className="group-hover:text-gold-300 transition-colors">Qatar, Doha</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ====== Divider ====== */}
        {/* <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold-500/20"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-black px-4">
              <Sparkles className="w-5 h-5 text-gold-500/50" />
            </div>
          </div>
        </div> */}

        {/* ====== Bottom Section ====== */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-sm">
          <p className="hover:text-gray-300 transition-colors duration-300">
            © {new Date().getFullYear()} عود الوجبة — جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-3 group cursor-pointer" onClick={handleYansyClick}>
            <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 border border-gold-500/20 hover:border-gold-500/50 hover:bg-gold-500/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <Heart className="w-4 h-4 text-gold-400 fill-gold-400  group-hover:animate-none group-hover:scale-125 transition-transform duration-300" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Developed by</span>
              <span className="relative font-black text-xl tracking-wider">
                <span className="absolute inset-0 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300">
                  YANSY
                </span>
                <span className="relative bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400 bg-clip-text text-transparent group-hover:from-gold-300 group-hover:via-gold-100 group-hover:to-gold-300 transition-all duration-300 group-hover:scale-110 inline-block">
                  YANSY
                </span>
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/20 via-transparent to-gold-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* ====== Subtle Glow Line ====== */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-400/50 to-transparent blur-[2px]" />
    </footer>
  );
}

export default Footer;
