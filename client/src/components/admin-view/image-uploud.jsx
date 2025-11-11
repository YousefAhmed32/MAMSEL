import { Label } from "@radix-ui/react-label";
import { useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { UploadCloudIcon, FileIcon, XIcon, ImagePlus, CheckCircle2 } from "lucide-react"; // ✅ استيراد FileIcon
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  imageLoadingStatus,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }
  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl(""); // Clear uploaded URL when removing image
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  console.log("Image File:", imageFile);

  // Upload image to local server (replaces Cloudinary)
  async function uploadImageToServer() {
    if (!imageFile) return;
    
    setImageLoadingState(true);
    const data = new FormData();
    data.append("image", imageFile); // Changed from "my_file" to "image" to match server expectation
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/products/image-upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log(response, "response");
      if (response?.data?.success) {
        // Use full URL with server origin for preview
        const fullUrl = `${import.meta.env.VITE_API_URL}${response.data.result.url}`;
        setUploadedImageUrl(fullUrl);
        console.log("Uploaded URL:", fullUrl);
      } else {
        console.error("Upload failed:", response?.data?.message);
        setUploadedImageUrl(""); // Clear URL on failure
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadedImageUrl(""); // Clear URL on error
      
      // Log more details for debugging
      if (error.response) {
        console.error("Server error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response from server:", error.request);
      }
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null && !isEditMode) {
      uploadImageToServer();
    }
  }, [imageFile]);

  return (
    <div className={`cursor-pointer w-full  mt-4 ${isCustomStyling ? '' : 'max-w-md mx-auto  '}`}>
      <Label className={`${isEditMode ? "opacity-60" : ""} text-lg font-semibold mb-2 block`}><ImagePlus size={20} className="inline text-emerald-400" /> Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4 cursor-pointer"
      >
 
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />
        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`${isEditMode ? "cursor-pointer" : ""} flex flex-col items-center justify-center h-36 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 mb-2 text-muted-foreground" />
            <span>Drag & drop or click to upload image</span>
          </Label>
        ) : imageLoadingStatus ? (
          <div className="flex items-center justify-center py-4">
            <Skeleton className="h-10 w-full bg-gray-100" />
            <span className="ml-2 text-sm text-muted-foreground">جاري الرفع...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium">{imageFile.name}</p>
                {uploadedImageUrl && (
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تم الرفع بنجاح</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemoveImage}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
