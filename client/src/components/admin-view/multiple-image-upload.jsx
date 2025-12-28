import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MultipleImageUpload = ({
  images = [],
  setImages,
  maxImages = 5,
  mainImageIndex = 0,
  setMainImageIndex,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    if (images.length + files.length > maxImages) {
      toast({
        title: 'تجاوز الحد الأقصى',
        description: `يمكنك رفع ${maxImages} صور كحد أقصى`,
      });
      return;
    }

    setIsUploading(true);

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file,
            name: file.name,
          };

          setImages((prev) => [...prev, newImage]);

          // إذا كانت هذه أول صورة، اجعلها الصورة الرئيسية
          if (images.length === 0) {
            setMainImageIndex(0);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setIsUploading(false);
    event.target.value = '';
  };

  const handleRemoveImage = (imageId) => {
    const imageIndex = images.findIndex((img) => img.id === imageId);

    setImages((prev) => prev.filter((img) => img.id !== imageId));

    // إذا كانت الصورة المحذوفة هي الرئيسية، اجعل الصورة الأولى الجديدة هي الرئيسية
    if (imageIndex === mainImageIndex) {
      setMainImageIndex(0);
    } else if (imageIndex < mainImageIndex) {
      setMainImageIndex((prev) => prev - 1);
    }
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
    toast({
      title: 'تم تعيين الصورة الرئيسية',
      description: 'تم تعيين هذه الصورة كصورة رئيسية للمنتج',
    });
  };

  // Color classes -- use black for all UI elements instead of gold/yellow
  // For backgrounds/borders adjust for dark/light mode
  // Tailwind: border-black, text-black, bg-black/10, bg-black/20, etc

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-neutral-100 dark:bg-neutral-900 border border-black/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-black/10 dark:bg-black/30">
              <ImageIcon className="w-6 h-6 text-black dark:text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                صور المنتج
              </h3>
              <p className="text-black/70 dark:text-white/60 text-sm">
                ارفع {maxImages} صور كحد أقصى (الصورة الأولى ستكون الرئيسية)
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-black/30 hover:border-black/60 rounded-xl p-8 text-center transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="multiple-image-upload"
              disabled={images.length >= maxImages}
            />

            <label htmlFor="multiple-image-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-black/10 dark:bg-black/30 rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-black dark:text-white" />
                  )}
                </div>

                <div>
                  <p className="text-black dark:text-white font-semibold">
                    {images.length >= maxImages
                      ? 'تم الوصول للحد الأقصى'
                      : 'اضغط لرفع الصور'}
                  </p>
                  <p className="text-black/70 dark:text-white/60 text-sm">
                    {images.length} / {maxImages} صور
                  </p>
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {images.length > 0 && (
        <Card className="bg-neutral-100 dark:bg-neutral-900 border border-black/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">
              الصور المرفوعة
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                    index === mainImageIndex
                      ? 'border-black shadow-[0_0_20px_rgba(0,0,0,0.17)]'
                      : 'border-black/30 hover:border-black/70'
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main Image Badge */}
                  {index === mainImageIndex && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black text-white dark:bg-white dark:text-black border-0">
                        <Star className="w-3 h-3 mr-1" />
                        رئيسية
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleSetMainImage(index)}
                        className="bg-white/90 dark:bg-black/90 border-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-8 h-8"
                        title="تعيين كصورة رئيسية"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleRemoveImage(image.id)}
                        className="bg-red-500/90 border-red-500 text-white hover:bg-red-600 w-8 h-8"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/80 text-white dark:bg-white/80 dark:text-black border-black/30 dark:border-white/30">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-black/10 dark:bg-black/30 rounded-lg border border-black/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-black/10 dark:bg-black/30">
                  <Eye className="w-5 h-5 text-black dark:text-white" />
                </div>
                <div>
                  <h4 className="text-black dark:text-white font-semibold mb-2">
                    نصائح مهمة:
                  </h4>
                  <ul className="text-black/70 dark:text-white/60 text-sm space-y-1">
                    <li>• الصورة الأولى ستظهر كصورة رئيسية في قائمة المنتجات</li>
                    <li>• يمكنك تغيير الصورة الرئيسية بالنقر على أيقونة النجمة</li>
                    <li>• الصور الإضافية ستظهر في معرض صور المنتج</li>
                    <li>• تأكد من جودة الصور ووضوحها</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultipleImageUpload;
