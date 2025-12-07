import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { fetchActiveBrands, createBrand, clearError, clearSuccess } from '@/store/admin/brands-slice';
import { Plus, Building2 } from 'lucide-react';

const BrandSelect = ({ value, onChange, label, required = false }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { t: translate } = useTranslation();
  const t = translate || ((key) => key); // Fallback to return key if t is undefined
  const { activeBrands, loading, error, success } = useSelector(state => state.adminBrands);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBrandData, setNewBrandData] = useState({
    name: '',
    nameEn: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    dispatch(fetchActiveBrands());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: t('common.error'),
        description: error,
        variant: "destructive"
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch, t]);

  useEffect(() => {
    if (success) {
      toast({
        title: "نجح",
        description: success,
      });
      dispatch(clearSuccess());
      setIsAddDialogOpen(false);
      setNewBrandData({
        name: '',
        nameEn: '',
        description: '',
        logo: ''
      });
    }
  }, [success, toast, dispatch]);

  const handleAddBrand = () => {
    if (!newBrandData.name || !newBrandData.nameEn) {
      toast({
        title: t('common.error'),
        description: t('brands.brandNameRequired'),
        variant: "destructive"
      });
      return;
    }

    dispatch(createBrand(newBrandData));
  };

  return (
    <div className="space-y-2 ">
      <label className="text-foreground font-bold text-sm sm:text-base lg:text-lg">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [&>option]:bg-background [&>option]:text-foreground"
          required={required}
        >
          <option value="" className="bg-background text-foreground">{t('brands.selectBrand')}</option>
          {activeBrands && activeBrands.length > 0 ? activeBrands.map((brand) => (
            <option key={brand._id} value={brand._id} className="bg-background text-foreground">
              {brand.name} ({brand.nameEn})
            </option>
          )) : (
            <option value="" disabled className="bg-background text-foreground">{t('brands.noBrandsAvailable')}</option>
          )}
        </select>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground hover:bg-primary hover:text-primary-foreground px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {t('brands.addNewBrand')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-foreground font-semibold mb-2 block">{t('brands.brandNameAr')} *</label>
                <Input
                  value={newBrandData.name}
                  onChange={(e) => setNewBrandData({...newBrandData, name: e.target.value})}
                  placeholder={t('brands.enterBrandNameAr')}
                  className="bg-background border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-foreground font-semibold mb-2 block">{t('brands.brandNameEn')} *</label>
                <Input
                  value={newBrandData.nameEn}
                  onChange={(e) => setNewBrandData({...newBrandData, nameEn: e.target.value})}
                  placeholder={t('brands.enterBrandNameEn')}
                  className="bg-background border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-foreground font-semibold mb-2 block">{t('brands.description')}</label>
                <Input
                  value={newBrandData.description}
                  onChange={(e) => setNewBrandData({...newBrandData, description: e.target.value})}
                  placeholder={t('brands.enterDescription')}
                  className="bg-background border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-foreground font-semibold mb-2 block">{t('brands.logoLink')}</label>
                <Input
                  value={newBrandData.logo}
                  onChange={(e) => setNewBrandData({...newBrandData, logo: e.target.value})}
                  placeholder={t('brands.enterLogoLink')}
                  className="bg-background border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddBrand}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  {loading ? t('brands.adding') : t('brands.addBrandButton')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-border text-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BrandSelect;
