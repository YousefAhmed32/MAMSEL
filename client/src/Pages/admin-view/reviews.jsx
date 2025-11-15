import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Enhanced realistic mock data with more variety and recent dates
const mockReviews = [
  {
    id: 1,
    productName: "شانيل رقم 5",
    customerName: "سارة أحمد",
    customerEmail: "sarah.ahmed@email.com",
    rating: 5,
    review: "عود رائع جداً! الرائحة أنيقة وتدوم طويلاً. مثالي للمناسبات الخاصة. أنصح به بشدة. التغليف كان فاخراً والتوصيل سريع جداً.",
    status: "approved",
    date: "2024-12-15",
    helpful: 24,
    verified: true,
    avatar: "سأ",
    productImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-12-10",
    orderId: "ORD-2024-001"
  },
  {
    id: 2,
    productName: "ديور سوفاج",
    customerName: "عمر حسن",
    customerEmail: "omar.hassan@email.com",
    rating: 4,
    review: "عود رجالي ممتاز. التصميم جميل والجودة عالية. سأطلب منه مرة أخرى بالتأكيد. الرائحة تدوم طوال اليوم.",
    status: "approved",
    date: "2024-12-14",
    helpful: 18,
    verified: true,
    avatar: "عح",
    productImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-12-08",
    orderId: "ORD-2024-002"
  },
  {
    id: 3,
    productName: "فيرساتشي إيروس",
    customerName: "فاطمة إبراهيم",
    customerEmail: "fatma.ibrahim@email.com",
    rating: 3,
    review: "العود مقبول لكن لا يدوم كما توقعت. التغليف كان جيداً. السعر مناسب. ربما يحتاج لرش أكثر من مرة.",
    status: "pending",
    date: "2024-12-13",
    helpful: 5,
    verified: false,
    avatar: "فإ",
    productImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-12-05",
    orderId: "ORD-2024-003"
  },
  {
    id: 4,
    productName: "جوتشي بلوم",
    customerName: "أحمد محمد",
    customerEmail: "ahmed.mohamed@email.com",
    rating: 5,
    review: "رائحة زهرية مذهلة! زوجتي تحبه كثيراً. الجودة استثنائية ويستحق كل قرش. التغليف فاخر جداً.",
    status: "approved",
    date: "2024-12-12",
    helpful: 32,
    verified: true,
    avatar: "أم",
    productImage: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-12-03",
    orderId: "ORD-2024-004"
  },
  {
    id: 5,
    productName: "توم فورد بلاك أوركيد",
    customerName: "منى علي",
    customerEmail: "mona.ali@email.com",
    rating: 2,
    review: "قوي جداً بالنسبة لي. الرائحة ساحقة وغير مناسبة للاستخدام اليومي. ربما يناسب المناسبات المسائية فقط.",
    status: "rejected",
    date: "2024-12-11",
    helpful: 3,
    verified: true,
    avatar: "مع",
    productImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-12-01",
    orderId: "ORD-2024-005"
  },
  {
    id: 6,
    productName: "إيف سان لوران ليبري",
    customerName: "ياسمين خالد",
    customerEmail: "yasmin.khaled@email.com",
    rating: 5,
    review: "عود نسائي رائع! الرائحة ناعمة وأنثوية. التغليف فاخر والجودة ممتازة. أنصح به لكل امرأة.",
    status: "approved",
    date: "2024-12-10",
    helpful: 28,
    verified: true,
    avatar: "يخ",
    productImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-28",
    orderId: "ORD-2024-006"
  },
  {
    id: 7,
    productName: "أرماني أكوا دي جيو",
    customerName: "كريم سعد",
    customerEmail: "karim.saad@email.com",
    rating: 4,
    review: "عود صيفي منعش. مناسب للطقس الحار. التوصيل كان سريعاً والتغليف ممتاز. الرائحة تدوم جيداً.",
    status: "approved",
    date: "2024-12-09",
    helpful: 15,
    verified: true,
    avatar: "كس",
    productImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-25",
    orderId: "ORD-2024-007"
  },
  {
    id: 8,
    productName: "فيكتوريا سيكريت بومب شيل",
    customerName: "رانيا محمود",
    customerEmail: "rania.mahmoud@email.com",
    rating: 3,
    review: "العود لطيف لكن السعر مرتفع قليلاً. الرائحة لا تدوم طويلاً كما أردت. ربما يحتاج لرش أكثر.",
    status: "pending",
    date: "2024-12-08",
    helpful: 4,
    verified: false,
    avatar: "رم",
    productImage: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-22",
    orderId: "ORD-2024-008"
  },
  {
    id: 9,
    productName: "هوجو بوس ذا سينت",
    customerName: "محمود أحمد",
    customerEmail: "mahmoud.ahmed@email.com",
    rating: 4,
    review: "عود رجالي كلاسيكي. الرائحة مميزة والجودة جيدة. أنصح به للرجال. التغليف أنيق والجودة عالية.",
    status: "approved",
    date: "2024-12-07",
    helpful: 22,
    verified: true,
    avatar: "مح",
    productImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-20",
    orderId: "ORD-2024-009"
  },
  {
    id: 10,
    productName: "كالفن كلاين إيترنيتي",
    customerName: "نور الدين",
    customerEmail: "nour.eldin@email.com",
    rating: 5,
    review: "عود رائع بكل المقاييس! الرائحة نظيفة ومنعشة. السعر مناسب والجودة ممتازة. سأطلب منه مرة أخرى.",
    status: "approved",
    date: "2024-12-06",
    helpful: 19,
    verified: true,
    avatar: "ند",
    productImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-18",
    orderId: "ORD-2024-010"
  },
  {
    id: 11,
    productName: "لانكوم لا في إست بيل",
    customerName: "هند محمد",
    customerEmail: "hind.mohamed@email.com",
    rating: 5,
    review: "عود نسائي رائع جداً! الرائحة أنيقة وتدوم طويلاً. مثالي للاستخدام اليومي. أنصح به بشدة.",
    status: "approved",
    date: "2024-12-05",
    helpful: 26,
    verified: true,
    avatar: "هم",
    productImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-15",
    orderId: "ORD-2024-011"
  },
  {
    id: 12,
    productName: "بوربون فانيلا",
    customerName: "خالد عبدالله",
    customerEmail: "khaled.abdullah@email.com",
    rating: 4,
    review: "عود رجالي مميز برائحة الفانيليا. مناسب للشتاء. الجودة جيدة والسعر معقول. التغليف أنيق.",
    status: "approved",
    date: "2024-12-04",
    helpful: 14,
    verified: true,
    avatar: "خع",
    productImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150&h=150&fit=crop&crop=center",
    purchaseDate: "2024-11-12",
    orderId: "ORD-2024-012"
  }
];

function AdminReviews() {
  const [reviews, setReviews] = useState(mockReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleStatusChange = (reviewId, newStatus) => {
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, status: newStatus } : review
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">موافق عليه</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">في الانتظار</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">مرفوض</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">غير محدد</Badge>;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-gold-950 fill-current" : "text-gray-400"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen luxury-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gold-950/20 backdrop-blur-sm">
              <Star className="w-8 h-8 text-gold-950" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text">
              إدارة التعليقات
            </h1>
          </div>
          <p className="text-gold-300 text-lg max-w-2xl mx-auto">
            إدارة تقييمات العملاء والتعليقات على المنتجات
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="perfume-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gold-950/20">
                <MessageSquare className="w-6 h-6 text-gold-950" />
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-white">{reviews.length}</h3>
                <p className="text-gold-300 text-sm">إجمالي التعليقات</p>
              </div>
            </div>
          </div>

          <div className="perfume-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <ThumbsUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-white">
                  {reviews.filter(r => r.status === "approved").length}
                </h3>
                <p className="text-gold-300 text-sm">موافق عليها</p>
              </div>
            </div>
          </div>

          <div className="perfume-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-white">
                  {reviews.filter(r => r.status === "pending").length}
                </h3>
                <p className="text-gold-300 text-sm">في الانتظار</p>
              </div>
            </div>
          </div>

          <div className="perfume-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-white">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </h3>
                <p className="text-gold-300 text-sm">متوسط التقييم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="perfume-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gold-950" />
            فلاتر البحث
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500 w-4 h-4" />
                <Input
                  placeholder="البحث في التعليقات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-navy-950/50 border-0 text-white placeholder-gold-300"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-navy-950/50 border-0 text-white"
            >
              <option value="all">جميع الحالات</option>
              <option value="approved">موافق عليها</option>
              <option value="pending">في الانتظار</option>
              <option value="rejected">مرفوضة</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 rounded-lg bg-navy-950/50 border-0 text-white"
            >
              <option value="all">جميع التقييمات</option>
              <option value="5">5 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="2">2 نجوم</option>
              <option value="1">نجمة واحدة</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="perfume-card p-6 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gold-950/20 flex items-center justify-center">
                          <span className="text-gold-950 font-bold text-lg">
                            {review.avatar}
                          </span>
                        </div>
                        {review.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{review.customerName}</h3>
                        <p className="text-gold-300 text-sm">{review.customerEmail}</p>
                      </div>
                      {review.verified && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          موثق
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={review.productImage} 
                          alt={review.productName}
                          className="w-16 h-16 rounded-lg object-cover border border-gold-500/30"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-lg mb-2">{review.productName}</h4>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-gold-300 text-sm">({review.rating}/5)</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gold-400">
                            <span>طلب: {review.orderId}</span>
                            <span>شراء: {review.purchaseDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gold-300 mb-4 leading-relaxed text-base">{review.review}</p>

                    <div className="flex items-center gap-6 text-sm text-gold-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{review.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.helpful} مفيد</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(review.status)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gold-500 hover:text-gold-300">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="luxury-gradient border-0">
                        {review.status !== "approved" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(review.id, "approved")}
                            className="text-white hover:bg-green-500/20"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            موافقة
                          </DropdownMenuItem>
                        )}
                        {review.status !== "rejected" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(review.id, "rejected")}
                            className="text-white hover:bg-red-500/20"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            رفض
                          </DropdownMenuItem>
                        )}
                        {review.status !== "pending" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(review.id, "pending")}
                            className="text-white hover:bg-yellow-500/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            وضع في الانتظار
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-white hover:bg-gold-950/20">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          رد
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gold-300 mx-auto mb-4" />
              <p className="text-gold-300 text-lg">لا توجد تعليقات</p>
              <p className="text-gold-400 text-sm">لم يتم العثور على تعليقات تطابق الفلاتر المحددة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminReviews;
