import ProductImageUpload from "@/components/admin-view/image-uploud";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  addFeatureImage,
  deleteFeatureImages,
  getFeatureImage,
  getFeatureImageMobile,
} from "@/store/shop/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Monitor,
  Smartphone,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Eye,
  Edit,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

function AdminFeatures() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingStatus, setImageLoadingState] = useState(false);
  const [activeTab, setActiveTab] = useState("desktop");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { featureImageList, featureImageListMobile } = useSelector(
    (state) => state.commonFeature
  );
  const dispatch = useDispatch();

  const handleUploadFeatureImage = () => {
    if (!uploadedImageUrl) {
      toast({
        title: t("banners.uploadImage"),
        description: t("banners.uploadDescription"),
      });
      return;
    }

    setIsUploading(true);
    dispatch(
      addFeatureImage({ image: uploadedImageUrl, device: "desktop" })
    ).then((res) => {
      setIsUploading(false);
      if (res?.payload?.success) {
        dispatch(getFeatureImage());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({
          title: t("banners.bannerUploaded"),
          description: t("banners.bannerUploadedDesktop"),
        });
      } else {
        toast({
          title: t("banners.uploadFailed"),
          description: t("banners.uploadError"),
        });
      }
    });
  };

  const handleUploadFeatureImageMobile = () => {
    if (!uploadedImageUrl) {
      toast({
        title: t("banners.uploadImage"),
        description: t("banners.uploadDescription"),
      });
      return;
    }

    setIsUploading(true);
    dispatch(
      addFeatureImage({ image: uploadedImageUrl, device: "mobile" })
    ).then((res) => {
      setIsUploading(false);
      if (res?.payload?.success) {
        dispatch(getFeatureImageMobile());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({
          title: t("banners.bannerUploaded"),
          description: t("banners.bannerUploadedMobile"),
        });
      } else {
        toast({
          title: t("banners.uploadFailed"),
          description: t("banners.uploadError"),
        });
      }
    });
  };

  function handleDeleteFeature(getCurrentProductId) {
    dispatch(deleteFeatureImages(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImage());
        dispatch(getFeatureImageMobile());
        toast({
          title: "تم حذف البانر بنجاح",
          description: "تم حذف البانر من النظام",
        });
      }
    });
  }

  const handleRefresh = () => {
    dispatch(getFeatureImage());
    dispatch(getFeatureImageMobile());
    toast({
      title: t("banners.dataRefreshed"),
      description: t("banners.bannersListRefreshed"),
    });
  };

  useEffect(() => {
    dispatch(getFeatureImage());
    dispatch(getFeatureImageMobile());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-12">
        {/* Enhanced Header */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/10 dark:bg-black/20 backdrop-blur-sm border border-black/30 dark:border-black/40">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-black dark:text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                {t("banners.title")}
              </h1>
              {/* No gold/yellow, black in light mode, white in dark */}
              <div className="w-24 sm:w-32 h-1 bg-black dark:bg-white mx-auto rounded-full" />
            </div>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
            {t("banners.subtitle")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-black/10 dark:bg-black/20">
                  <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-black dark:text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {featureImageList?.length || 0}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("banners.desktopBanners")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-black/10 dark:bg-black/20">
                  <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-black dark:text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {featureImageListMobile?.length || 0}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("banners.mobileBanners")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-black/10 dark:bg-black/20">
                  <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-black dark:text-white" />
                </div>
                <div>
                  <Button
                    onClick={handleRefresh}
                    className="bg-black hover:bg-neutral-900 text-white font-semibold text-sm sm:text-base"
                  >
                    {t("banners.refreshData")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-border">
            <div className="flex gap-1 sm:gap-2">
              <Button
                onClick={() => setActiveTab("desktop")}
                variant={activeTab === "desktop" ? "default" : "ghost"}
                className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "desktop"
                    ? "bg-black text-white shadow-md"
                    : "bg-transparent text-black dark:text-white hover:text-white hover:bg-black/70"
                }`}
                style={{
                  "--tw-hover-bg": "rgba(0,0,0,0.7)",
                  "--tw-hover-text": "#fff",
                }}
              >
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">بنرات الكمبيوتر</span>
                <span className="sm:hidden">كمبيوتر</span>
              </Button>
              <Button
                onClick={() => setActiveTab("mobile")}
                variant={activeTab === "mobile" ? "default" : "ghost"}
                className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "mobile"
                    ? "bg-black text-white shadow-md"
                    : "bg-transparent text-black dark:text-white hover:text-white hover:bg-black/70"
                }`}
                style={{
                  "--tw-hover-bg": "rgba(0,0,0,0.7)",
                  "--tw-hover-text": "#fff",
                }}
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">بنرات الجوال</span>
                <span className="sm:hidden">جوال</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Tab */}
        {activeTab === "desktop" && (
          <div className="space-y-8">
            {/* Upload Section */}
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-black/20 dark:bg-black/40">
                    <Upload className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{t("banners.uploadNewDesktop")}</h2>
                    <p className="text-black/70 dark:text-white/80">
                      {t("banners.selectHighQuality")}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 dark:bg-muted/30 rounded-2xl p-6 border border-border">
                  <ProductImageUpload
                    imageFile={imageFile}
                    setImageFile={setImageFile}
                    uploadedImageUrl={uploadedImageUrl}
                    setUploadedImageUrl={setUploadedImageUrl}
                    setImageLoadingState={setImageLoadingState}
                    imageLoadingStatus={imageLoadingStatus}
                    isCustomStyling={true}
                  />

                  {uploadedImageUrl && (
                    <div className="mt-4 p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border">
                      <p className="text-black dark:text-white text-sm mb-2">{t("banners.previewImage")}</p>
                      <img
                        src={uploadedImageUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleUploadFeatureImage}
                    disabled={isUploading || !uploadedImageUrl || imageLoadingStatus}
                    className="w-full mt-6 bg-black hover:bg-neutral-900 text-white font-bold py-4 text-xl rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : !uploadedImageUrl || imageLoadingStatus ? (
                      <>
                        <AlertCircle className="w-6 h-6 mr-2" />
                        يرجى اختيار صورة أولاً
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mr-2" />
                        إضافة بانر الكمبيوتر +
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Banners Grid */}
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-black/20 dark:bg-black/40">
                    <Monitor className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      {t("banners.currentDesktopBanners")}
                    </h2>
                    <p className="text-black/70 dark:text-white/80">
                      {t("banners.manageDesktopBanners")}
                    </p>
                  </div>
                </div>

                {featureImageList?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featureImageList.map((featureImageItem, index) => (
                      <div
                        key={featureImageItem._id}
                        className="group relative rounded-2xl overflow-hidden border border-border bg-muted/50 dark:bg-muted/30 hover:border-black/30 dark:hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                      >
                        <div className="aspect-video overflow-hidden bg-muted/30 dark:bg-muted/20">
                          <img
                            src={
                              featureImageItem.image?.startsWith("http")
                                ? featureImageItem.image
                                : `${import.meta.env.VITE_API_URL}${
                                    featureImageItem.image || ""
                                  }`
                            }
                            alt="Desktop Banner"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-black/80 dark:bg-black border-black text-white hover:bg-white hover:text-black"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-black/80 dark:bg-black border-black text-white hover:bg-white hover:text-black"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            onClick={() => handleDeleteFeature(featureImageItem._id)}
                            className="bg-red-500/90 border-red-500 text-foreground hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-black/10 dark:bg-black/30 text-black dark:text-white border-black/20 dark:border-black/40">
                              بانر #{index + 1}
                            </Badge>
                            <div className="flex items-center gap-1 text-black/70 dark:text-white/80 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              نشط
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Monitor className="w-16 h-16 text-black/30 dark:text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد بنرات للكمبيوتر</h3>
                    <p className="text-black/70 dark:text-white/80">ابدأ برفع أول بانر للكمبيوتر</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mobile Tab */}
        {activeTab === "mobile" && (
          <div className="space-y-8">
            {/* Upload Section */}
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-black/20 dark:bg-black/40">
                    <Upload className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{t("banners.uploadNewMobile")}</h2>
                    <p className="text-black/70 dark:text-white/80">
                      {t("banners.selectOptimized")}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 dark:bg-muted/30 rounded-2xl p-6 border border-border">
                  <ProductImageUpload
                    imageFile={imageFile}
                    setImageFile={setImageFile}
                    uploadedImageUrl={uploadedImageUrl}
                    setUploadedImageUrl={setUploadedImageUrl}
                    setImageLoadingState={setImageLoadingState}
                    imageLoadingStatus={imageLoadingStatus}
                    isCustomStyling={true}
                  />

                  {uploadedImageUrl && (
                    <div className="mt-4 p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border">
                      <p className="text-black dark:text-white text-sm mb-2">{t("banners.previewImage")}</p>
                      <img
                        src={uploadedImageUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleUploadFeatureImageMobile}
                    disabled={isUploading || !uploadedImageUrl || imageLoadingStatus}
                    className="w-full mt-6 bg-black hover:bg-neutral-900 text-white font-bold py-4 text-xl rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : !uploadedImageUrl || imageLoadingStatus ? (
                      <>
                        <AlertCircle className="w-6 h-6 mr-2" />
                        يرجى اختيار صورة أولاً
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mr-2" />
                        إضافة بانر الجوال +
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Banners Grid */}
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-black/20 dark:bg-black/40">
                    <Smartphone className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">بنرات الجوال الحالية</h2>
                    <p className="text-black/70 dark:text-white/80">
                      إدارة البنرات المعروضة على الهواتف المحمولة
                    </p>
                  </div>
                </div>

                {featureImageListMobile?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featureImageListMobile.map((featureImageItem, index) => (
                      <div
                        key={featureImageItem._id}
                        className="group relative rounded-2xl overflow-hidden border border-border bg-muted/50 dark:bg-muted/30 hover:border-black/30 dark:hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                      >
                        <div className="aspect-[9/16] overflow-hidden bg-muted/30 dark:bg-muted/20">
                          <img
                            src={
                              featureImageItem.image?.startsWith("http")
                                ? featureImageItem.image
                                : `${import.meta.env.VITE_API_URL}${
                                    featureImageItem.image || ""
                                  }`
                            }
                            alt="Mobile Banner"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-black/80 dark:bg-black border-black text-white hover:bg-white hover:text-black"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-black/80 dark:bg-black border-black text-white hover:bg-white hover:text-black"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            onClick={() => handleDeleteFeature(featureImageItem._id)}
                            className="bg-red-500/90 border-red-500 text-foreground hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-black/10 dark:bg-black/30 text-black dark:text-white border-black/20 dark:border-black/40">
                              {t("banners.bannerNumber", { number: index + 1 })}
                            </Badge>
                            <div className="flex items-center gap-1 text-black/70 dark:text-white/80 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              {t("banners.active")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Smartphone className="w-16 h-16 text-black/30 dark:text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {t("banners.noMobileBanners")}
                    </h3>
                    <p className="text-black/70 dark:text-white/80">{t("banners.startUploadMobile")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeatures;
