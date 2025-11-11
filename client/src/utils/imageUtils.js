/**
 * Utility function to get full image URL
 * Handles both absolute URLs (like Cloudinary) and relative paths (local storage)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-product.jpg';
  }
  
  // If it's already a full URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize path - ensure it starts with /
  let normalizedPath = imagePath;
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // If it's a relative path (contains uploads)
  if (normalizedPath.includes('uploads')) {
    // In development
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      return `${import.meta.env.VITE_API_URL}${normalizedPath}`;
    }
    // In production, use the same origin
    return normalizedPath;
  }
  
  // For other relative paths
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    return `${import.meta.env.VITE_API_URL}${normalizedPath}`;
  }
  
  // Fallback
  return normalizedPath;
};

/**
 * Handle image objects from new format { url, filename, path, etc. }
 */
export const getProductImageUrl = (product) => {
  if (!product) return '/placeholder-product.jpg';
  
  // If product has main image
  if (product.image) {
    // Check if it's an object with url property
    if (typeof product.image === 'object' && product.image.url) {
      return getImageUrl(product.image.url);
    }
    // If it's a string
    return getImageUrl(product.image);
  }
  
  // If no main image, try to get first image from images array
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    // Check if it's an object with url property
    if (typeof firstImage === 'object' && firstImage.url) {
      return getImageUrl(firstImage.url);
    }
    // If it's a string
    if (typeof firstImage === 'string') {
      return getImageUrl(firstImage);
    }
  }
  
  return '/placeholder-product.jpg';
};

/**
 * Get all product image URLs (for gallery)
 */
export const getProductImages = (product) => {
  if (!product) return [];
  
  const imageUrls = [];
  
  // Add main image
  if (product.image) {
    if (typeof product.image === 'object' && product.image.url) {
      imageUrls.push(getImageUrl(product.image.url));
    } else if (typeof product.image === 'string') {
      imageUrls.push(getImageUrl(product.image));
    }
  }
  
  // Add images from array
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (typeof img === 'object' && img.url) {
        const url = getImageUrl(img.url);
        if (!imageUrls.includes(url)) imageUrls.push(url);
      } else if (typeof img === 'string') {
        const url = getImageUrl(img);
        if (!imageUrls.includes(url)) imageUrls.push(url);
      }
    });
  }
  
  return imageUrls.length > 0 ? imageUrls : ['/placeholder-product.jpg'];
};

