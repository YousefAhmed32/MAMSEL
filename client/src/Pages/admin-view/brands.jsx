import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  clearError,
  clearSuccess
} from '@/store/admin/brands-slice';
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const BrandsManagement = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { t: translate } = useTranslation();
  const t = translate || ((key) => key);
  const { brands, loading, error, success } = useSelector(state => state.adminBrands);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    dispatch(fetchAllBrands());
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
        title: t('common.success'),
        description: success,
      });
      dispatch(clearSuccess());
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    }
  }, [success, toast, dispatch, t]);

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      logo: ''
    });
    setEditingBrand(null);
  };

  const handleAddBrand = () => {
    if (!formData.name || !formData.nameEn) {
      toast({
        title: t('common.error'),
        description: t('brands.brandNameRequired'),
        variant: "destructive"
      });
      return;
    }

    dispatch(createBrand(formData));
  };

  const handleEditBrand = () => {
    if (!formData.name || !formData.nameEn) {
      toast({
        title: t('common.error'),
        description: t('brands.brandNameRequired'),
        variant: "destructive"
      });
      return;
    }

    dispatch(updateBrand({ id: editingBrand._id, brandData: formData }));
  };

  const handleDeleteBrand = (brand) => {
    if (window.confirm(t('brands.deleteConfirm', { name: brand.name }))) {
      dispatch(deleteBrand(brand._id));
    }
  };

  const handleToggleStatus = (brand) => {
    dispatch(toggleBrandStatus(brand._id));
  };

  const openEditDialog = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      nameEn: brand.nameEn,
      description: brand.description || '',
      logo: brand.logo || ''
    });
    setIsEditDialogOpen(true);
  };

  const filteredBrands = brands?.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-black/30 to-black/10 border border-black/30 shadow-[0_0_20px_rgba(0,0,0,0.10)]">
            <Building2 className="w-8 h-8 text-black dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">{t('brands.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('brands.subtitle')}</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => resetForm()}
              className="bg-gradient-to-r from-black to-neutral-800 hover:from-neutral-800 hover:to-black text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('brands.addBrand')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 backdrop-blur-sm border border-black/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black dark:text-white">{t('brands.addNewBrand')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.brandNameAr')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('brands.enterBrandNameAr')}
                  className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                />
              </div>
              <div>
                <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.brandNameEn')}</label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  placeholder={t('brands.enterBrandNameEn')}
                  className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                />
              </div>
              <div>
                <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.description')}</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={t('brands.enterDescription')}
                  className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                />
              </div>
              <div>
                <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.logoLink')}</label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  placeholder={t('brands.enterLogoLink')}
                  className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddBrand}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-black to-neutral-800 hover:from-neutral-800 hover:to-black text-white font-bold"
                >
                  {loading ? t('brands.adding') : t('brands.addBrandButton')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border border-black/30 text-black dark:text-white hover:bg-black hover:text-white"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/60 dark:text-white/30" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('brands.searchBrands')}
          className="bg-white/90 dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50 pr-12"
        />
      </div>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-black/30 dark:text-white/20 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('brands.noBrands')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
          <Card key={brand._id} className="bg-white/90 dark:bg-neutral-900 backdrop-blur-sm border border-black/20 hover:border-black/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {brand.logo && (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-black dark:text-white text-lg">{brand.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{brand.nameEn}</p>
                  </div>
                </div>
                <Badge
                  variant={brand.isActive ? "default" : "secondary"}
                  className={brand.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"}
                >
                  {brand.isActive ? t('brands.active') : t('brands.inactive')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {brand.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{brand.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(brand)}
                    className="border border-black/30 text-black dark:text-white hover:bg-black hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBrand(brand)}
                    className="border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(brand)}
                  disabled={loading}
                  className="border border-black/30 text-black dark:text-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {brand.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 backdrop-blur-sm border border-black/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black dark:text-white">{t('brands.editBrand')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.brandNameAr')}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('brands.enterBrandNameAr')}
                className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              />
            </div>
            <div>
              <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.brandNameEn')}</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                placeholder={t('brands.enterBrandNameEn')}
                className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              />
            </div>
            <div>
              <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.description')}</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('brands.enterDescription')}
                className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              />
            </div>
            <div>
              <label className="text-black dark:text-white font-semibold mb-2 block">{t('brands.logoLink')}</label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                placeholder={t('brands.enterLogoLink')}
                className="bg-white dark:bg-neutral-900 border border-black/30 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleEditBrand}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-black to-neutral-800 hover:from-neutral-800 hover:to-black text-white font-bold"
              >
                {loading ? t('brands.updating') : t('brands.updateBrandButton')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border border-black/30 text-black dark:text-white hover:bg-black hover:text-white"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsManagement;
