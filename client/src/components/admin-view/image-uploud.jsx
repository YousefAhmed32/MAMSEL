import { Label } from "@radix-ui/react-label";
import { useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { UploadCloudIcon, FileIcon, XIcon } from "lucide-react"; // ✅ استيراد FileIcon
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
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  console.log("Image File:", imageFile);

  async function uploadImageToCloudinary() {
    setImageLoadingState(true);
    const data = new formData();
    data.append("my_file", imageFile);
    const response = await axios.post(
      "http://localhost:5000/api/admin/products/image-upload",
      data
    );
    console.log(response, "response");
    if (response?.data?.success) {
      setUploadedImageUrl(response.data.result.url);
      setImageLoadingState(false);
      console.log("Uploaded URL:", uploadedImageUrl);
    }
    

  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
  }, [imageFile]);

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Label className={`${isEditMode ? "opacity-60" : ""} text-lg font-semibold mb-2 block`}>Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4"
      >
        {/* {youns} */}
        {uploadedImageUrl && (
          <div className="mt-4">
            <img
              src={uploadedImageUrl}
              alt="Uploaded preview"
              className="w-full max-h-64 object-cover rounded-md"
            />
          </div>
        )}
        {/* youns */}
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
            className={`${isEditMode ? "cursor-pointer" : ""} flex flex-col items-center justify-center h-36`}
          >
            <UploadCloudIcon className="w-10 h-10 mb-2 text-muted-foreground" />
            <span>Drag & drop or click to upload image</span>
          </Label>
        ) : imageLoadingStatus ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 h-8 text-primary mr-2" />
            </div>
            <p className="text-sm font-medium">{imageFile.name}</p>
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
