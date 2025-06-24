import ProductImageUpload from "@/components/admin-view/image-uploud";
import AdminProductTitle from "@/components/admin-view/product-title";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { useToast } from "@/hooks/use-toast";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProduct,
} from "@/store/admin/product-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
};

function AdminProducts() {
  const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingStatus, setImageLoadingState] = useState(false);

  const [currentEditId, setCurrentEditId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    if (currentEditId) {
      dispatch(
        editProduct({
          id: currentEditId,
          formData: {
            ...formData,
            image: uploadedImageUrl,
          },
        })
      ).then((data) => {
        console.log(data);
        if (data?.payload?.success) {
          dispatch(fetchAllProduct());
          setFormData(initialFormData);
          setOpenCreateProductDialog(false);
          setCurrentEditId(null);
          setImageFile(null);
          toast({
            title: "Product updated successfully",
          });
        }
      });
    } else {
      dispatch(
        addNewProduct({
          ...formData,
          image: uploadedImageUrl,
        })
      ).then((data) => {
        console.log(data);
        if (data?.payload?.success) {
          dispatch(fetchAllProduct());
          setImageFile(null);
          setOpenCreateProductDialog(false);
          setFormData(initialFormData);
          toast({
            title: "Product added successfully",
          });
        }
      });
    }
  }




  function handleDelete(getCurrentProductId){
      dispatch(deleteProduct(getCurrentProductId)).then((data)=>{
        if(data?.payload?.success){
          dispatch(fetchAllProduct())
          toast({
            title:' Product deleted successfully'
          })
        }
      })
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  useEffect(() => {
    console.log(productList, uploadedImageUrl, "productList");
    dispatch(fetchAllProduct());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="flex   justify-end w-full mb-5">
        <Button onClick={() => setOpenCreateProductDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTitle
                setFormData={setFormData}
                setOpenCreateProductDialog={setOpenCreateProductDialog}
                setCurrentEditId={setCurrentEditId}
                key={productItem._id}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductDialog}
        onOpenChange={() => {
          setOpenCreateProductDialog(false);
          setCurrentEditId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle className="block">
              {currentEditId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoadingState={setImageLoadingState}
              imageLoadingStatus={imageLoadingStatus}
              isEditMode={currentEditId !== null}
            />
          </SheetHeader>
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditId ? "Update" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
              
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
