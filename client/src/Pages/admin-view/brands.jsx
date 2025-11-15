import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
        title: "خطأ",
        description: error,
        variant: "destructive"
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  useEffect(() => {
    if (success) {
      toast({
        title: "نجح",
        description: success,
      });
      dispatch(clearSuccess());
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    }
  }, [success, toast, dispatch]);

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
        title: "خطأ",
        description: "اسم العلامة التجارية بالعربية والإنجليزية مطلوب",
        variant: "destructive"
      });
      return;
    }

    dispatch(createBrand(formData));
  };

  const handleEditBrand = () => {
    if (!formData.name || !formData.nameEn) {
      toast({
        title: "خطأ",
        description: "اسم العلامة التجارية بالعربية والإنجليزية مطلوب",
        variant: "destructive"
      });
      return;
    }

    dispatch(updateBrand({ id: editingBrand._id, brandData: formData }));
  };

  const handleDeleteBrand = (brand) => {
    if (window.confirm(`هل أنت متأكد من حذف العلامة التجارية "${brand.name}"؟`)) {
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
          <div className="p-3 rounded-2xl bg-gradient-to-br from-luxury-gold/30 to-luxury-gold/10 border border-luxury-gold/30 shadow-[0_0_20px_rgba(210,176,101,0.3)]">
            <Building2 className="w-8 h-8 text-luxury-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">إدارة العلامات التجارية</h1>
            <p className="text-luxury-gold/70">إدارة العلامات التجارية في المتجر</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => resetForm()}
              className="bg-gradient-to-r from-luxury-gold to-luxury-gold-light hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-navy font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(210,176,101,0.4)] transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              إضافة علامة تجارية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-luxury-navy/95 backdrop-blur-sm border-luxury-gold/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-luxury-gold">إضافة علامة تجارية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">اسم العلامة التجارية (عربي)</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="أدخل اسم العلامة التجارية بالعربية"
                  className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">اسم العلامة التجارية (إنجليزي)</label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  placeholder="أدخل اسم العلامة التجارية بالإنجليزية"
                  className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">الوصف (اختياري)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="أدخل وصف العلامة التجارية"
                  className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">رابط الشعار (اختياري)</label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  placeholder="أدخل رابط شعار العلامة التجارية"
                  className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddBrand}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-navy font-bold"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة العلامة التجارية'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-gold/70" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث في العلامات التجارية..."
          className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50 pr-12"
        />
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <Card key={brand._id} className="bg-luxury-navy/20 backdrop-blur-sm border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300">
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
                    <CardTitle className="text-white text-lg">{brand.name}</CardTitle>
                    <p className="text-luxury-gold/70 text-sm">{brand.nameEn}</p>
                  </div>
                </div>
                <Badge
                  variant={brand.isActive ? "default" : "secondary"}
                  className={brand.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}
                >
                  {brand.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {brand.description && (
                <p className="text-white/70 text-sm mb-4">{brand.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(brand)}
                    className="border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBrand(brand)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(brand)}
                  disabled={loading}
                  className="border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {brand.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-luxury-navy/95 backdrop-blur-sm border-luxury-gold/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-luxury-gold">تعديل العلامة التجارية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white font-semibold mb-2 block">اسم العلامة التجارية (عربي)</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="أدخل اسم العلامة التجارية بالعربية"
                className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
              />
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">اسم العلامة التجارية (إنجليزي)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                placeholder="أدخل اسم العلامة التجارية بالإنجليزية"
                className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
              />
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">الوصف (اختياري)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="أدخل وصف العلامة التجارية"
                className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
              />
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">رابط الشعار (اختياري)</label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                placeholder="أدخل رابط شعار العلامة التجارية"
                className="bg-luxury-navy/50 border-luxury-gold/30 text-white placeholder-white/50"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleEditBrand}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-navy font-bold"
              >
                {loading ? 'جاري التحديث...' : 'تحديث العلامة التجارية'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsManagement;
