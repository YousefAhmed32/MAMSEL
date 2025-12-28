import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import { addCouponFormElements } from "@/config";
import { addCoupon, fetchAllCoupons, deleteCoupon } from "@/store/admin/coupon";
import CommonForm from "../../components/common/form";
import { Sparkles, PlusCircle, Ticket, Loader2, Trash2, Edit2, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function AdminCoupon() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const { couponList = [], isLoading } = useSelector((state) => state.adminCoupon);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.discountType || !formData.discountValue || !formData.expiryDate) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Validate discount value based on type
    if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
      toast({
        title: t('common.error'),
        description: t('coupons.discountRange'),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Map frontend format to backend format
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType === 'percentage' ? 'percent' : 'fixed',
        amount: Number(formData.discountValue),
        expiresAt: formData.expiryDate,
        usageLimitGlobal: formData.usageLimit ? Number(formData.usageLimit) : null,
        usageLimitPerUser: 1,
        minOrderAmount: 0
      };

      const result = await dispatch(addCoupon(couponData));

      if (result.payload?.success) {
        toast({
          title: t('common.success'),
          description: t('coupons.couponCreated'),
        });
        // Reset form
        setFormData({});
        // Refresh list
        await dispatch(fetchAllCoupons());
      } else {
        toast({
          title: t('common.error'),
          description: result.payload?.message || t('coupons.couponCreated'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: t('common.error'),
        description: t('coupons.couponCreated'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm(t('coupons.deleteConfirm'))) {
      return;
    }

    try {
      const result = await dispatch(deleteCoupon({ id: couponId }));
      if (result.payload?.success) {
        toast({
          title: "نجح",
          description: "تم حذف الكوبون بنجاح!",
        });
        await dispatch(fetchAllCoupons());
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الكوبون",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: t('coupons.codeCopied'),
      description: `${t('coupons.codeCopied')}: "${code}"`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('coupons.noExpiry');
    const date = new Date(dateString);
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 dark:bg-primary/20 backdrop-blur-sm">
              <Ticket className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground glow-text">
              {t('coupons.title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('coupons.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Form Section */}
          <div className="bg-card border border-border shadow-sm p-4 sm:p-6 rounded-xl space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <PlusCircle className="text-primary" size={24} />
              {t('coupons.createNew')}
            </h3>

            <CommonForm
              formControls={addCouponFormElements}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              buttonText={
                submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> {t('coupons.adding')}
                  </span>
                ) : (
                  t('coupons.addCoupon')
                )
              }
              isBtnDisabled={submitting}
              labelClassName="text-muted-foreground text-sm font-medium mb-2 block"
              inputClassName="bg-background dark:bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary rounded-lg px-4 py-2 w-full transition duration-150 [&[type='date']]:text-foreground [&[type='date']]:bg-background [&[type='date']]:dark:bg-background [&[type='date']]:dark:text-foreground [&[type='date']]:pr-10"
            />

            {/* Preview */}
            <div className="mt-6 bg-muted/50 dark:bg-muted/30 p-5 rounded-xl border border-border">
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Ticket className="text-primary" size={20} /> {t('coupons.preview')}
              </h4>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  <span className="text-primary">{t('coupons.code')}:</span>{" "}
                  <span className="font-bold text-foreground">{formData.code?.toUpperCase() || "N/A"}</span>
                </p>
                <p>
                  <span className="text-primary">{t('coupons.discount')}:</span>{" "}
                  <span className="font-bold text-primary">
                    {formData.discountType === "percentage"
                      ? `${formData.discountValue || 0}%`
                      : `$${formData.discountValue || 0}`}
                  </span>
                </p>
                <p>
                  <span className="text-primary">{t('coupons.expiryDate')}:</span>{" "}
                  <span className="text-foreground">{formData.expiryDate ? formatDate(formData.expiryDate) : t('coupons.notSpecified')}</span>
                </p>
                {formData.usageLimit && (
                  <p>
                    <span className="text-primary">{t('coupons.usageLimit')}:</span>{" "}
                    <span className="text-foreground">{formData.usageLimit} {t('coupons.times')}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Coupon List Section */}
          <div className="bg-card border border-border shadow-sm p-6 rounded-xl">
            <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Ticket className="text-primary" size={24} />
              جميع الكوبونات ({couponList?.length || 0})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-muted-foreground ml-3">جاري التحميل...</span>
              </div>
            ) : !couponList || couponList.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="text-muted-foreground/50 mx-auto mb-4" size={48} />
                <p className="text-muted-foreground/70">لا توجد كوبونات</p>
              </div>
            ) : (
              <div className="space-y-4">
                {couponList.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt || coupon.expiryDate);
                  const discountType = coupon.discountType || (coupon.discount === 'percentage' ? 'percent' : 'fixed');
                  const discountValue = coupon.amount || coupon.discountValue || 0;

                  return (
                    <div
                      key={coupon._id}
                      className={
                        `bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:bg-muted/50 transition-all p-5 rounded-xl border-2 ` +
                        (
                          expired
                            ? 'border-red-500/30 opacity-60'
                            : 'border-border hover:border-black dark:hover:border-black'
                        )
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Ticket
                              size={20}
                              className={expired ? 'text-red-400' : 'text-primary'}
                            />
                            <p className="text-xl font-bold text-foreground flex items-center gap-2">
                              {coupon.code}
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="p-1 hover:bg-primary/10 dark:bg-primary/20 rounded transition-colors"
                                title={t('coupons.copyCode')}
                              >
                                {copiedCode === coupon.code ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                            </p>
                            {expired && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                {t('coupons.expired')}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              <span className="text-primary">الخصم:</span>{" "}
                              <span className="font-bold text-primary">
                                {discountType === 'percent' || discountType === 'percentage'
                                  ? `${discountValue}%`
                                  : `$${discountValue}`}
                              </span>
                            </p>
                            <p className="text-muted-foreground">
                              <span className="text-primary">الاستخدام:</span>{" "}
                              <span className="text-foreground font-semibold">
                                {coupon.usedCount || 0} / {coupon.usageLimitGlobal || coupon.usageLimit || '∞'}
                              </span>
                            </p>
                            <p className="text-muted-foreground">
                              <span className="text-primary">تاريخ الانتهاء:</span>{" "}
                              <span className={expired ? 'text-red-400' : 'text-foreground'}>
                                {formatDate(coupon.expiresAt || coupon.expiryDate)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCoupon;
