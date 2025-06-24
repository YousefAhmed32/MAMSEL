import { Card, CardFooter, CardContent } from "../ui/card";
import { Button } from "../ui/button";

function AdminProductTitle({
  product,
  setOpenCreateProductDialog,
  setFormData,
  setCurrentEditId,
  handleDelete,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          {product?.image ? (
            <img
              src={product.image}
              alt={product.title || "Product image"}
              className="w-full h-[300px] object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 text-gray-500 rounded-t-lg">
              No Image Available
            </div>
          )}
        </div>

        <CardContent>
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through " : ""
              }text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 && (
              <span className="text-lg font-bold">${product?.salePrice}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            onClick={() => {
              setCurrentEditId(product._id || product.id); // حسب اسم الحقل اللي عندك
              setFormData({
                title: product.title || "",
                description: product.description || "",
                category: product.category || "",
                brand: product.brand || "",
                price: product.price || "",
                salePrice: product.salePrice || "",
                image: product.image || "",
                totalStock: product.totalStock || "",
              });
              setOpenCreateProductDialog(true);
            }}
          >
            Edit
          </Button>

          <Button onClick={() => handleDelete({ id: product?._id })}>Delete</Button>

        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTitle;
