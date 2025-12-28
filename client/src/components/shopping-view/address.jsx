import { addressFormControls } from "@/config";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editAddress,
  fetchAllAddress,
} from "@/store/shop/address-slice.js";
import AddressCard from "@/Pages/shopping-view/address-cart";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit2, X, CheckCircle2, Building2, Phone, Hash, FileText } from "lucide-react";

function Address({ setCurrentSelectedAddress, selectedId }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);

  const [currentEditId, setCurrentEditId] = useState(null);
  const initialAddressFormData = {
    address: "",
    city: "",
    phone: "",
    pincode: "",
    notes: "",
  };
  const [formData, setFormData] = useState(initialAddressFormData);

  useEffect(() => {
    if (user?.id) dispatch(fetchAllAddress(user.id));
  }, [dispatch, user]);

  const handleMessageAddress = (e) => {
    e.preventDefault();

    if (addressList.length >= 3 && currentEditId === null) {
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });
      return;
    }

    const action = currentEditId
      ? editAddress({
          userId: user.id,
          addressId: currentEditId,
          formData,
        })
      : addNewAddress({
          ...formData,
          userId: user.id,
        });

    dispatch(action).then((res) => {
      if (res.payload.success) {
        dispatch(fetchAllAddress(user.id));
        setFormData(initialAddressFormData);
        setCurrentEditId(null);
        toast({
          title: currentEditId ? "Address updated successfully" : "Address added successfully",
        });
      }
    });
  };

  const handleDeleteAddress = (address) => {
    dispatch(deleteAddress({ userId: user.id, addressId: address._id })).then((res) => {
      if (res.payload.success) {
        dispatch(fetchAllAddress(user.id));
        setFormData(initialAddressFormData);
        toast({ title: "Address deleted successfully" });
      }
    });
  };

  const handleEditAddress = (address) => {
    setCurrentEditId(address?._id);
    setFormData({
      address: address?.address,
      city: address?.city,
      phone: address?.phone,
      pincode: address?.pincode,
      notes: address?.notes,
    });
  };

  const handleCancelEdit = () => {
    setCurrentEditId(null);
    setFormData(initialAddressFormData);
  };

  const isFormValid = () => {
    return Object.values(formData).every((val) => val.trim() !== "");
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      address: MapPin,
      city: Building2,
      phone: Phone,
      pincode: Hash,
      notes: FileText,
    };
    return icons[fieldName] || MapPin;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Main Card Container */}
      <Card className="perfume-card border-0 shadow-2xl rounded-3xl overflow-hidden 
        bg-gradient-to-br from-background via-card/50 to-background
        dark:from-card dark:via-card/80 dark:to-card
        transition-all duration-500">
        
        {/* Header Section */}
        <CardHeader className="px-6 sm:px-8 pt-8 pb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent 
          dark:from-primary/20 dark:via-primary/10 dark:to-transparent
          border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/20 dark:bg-primary/30 
                backdrop-blur-sm border border-primary/30">
                <MapPin className="h-6 w-6 text-primary dark:text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight
                  text-foreground dark:text-foreground
                  bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {currentEditId ? "Edit Address" : "Add a new address"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentEditId 
                    ? "Update your address information" 
                    : "Manage your delivery addresses"}
                </p>
              </div>
            </div>
            {currentEditId && (
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-destructive/10 hover:text-destructive
                  transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Existing Addresses Section */}
          {addressList?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground
                  flex items-center gap-2 px-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Your saved addresses                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {addressList.map((item) => (
                  <AddressCard
                    key={item._id}
                    selectedId={selectedId}
                    handleDeleteAddress={handleDeleteAddress}
                    handleEditAddress={handleEditAddress}
                    setCurrentSelectedAddress={setCurrentSelectedAddress}
                    addressInfo={item}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Form Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground
                flex items-center gap-2 px-4">
                {currentEditId ? (
                  <>
                    <Edit2 className="h-5 w-5 text-primary" />
                    Update Address Information
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-primary" />
                    Fill Address Form
                  </>
                )}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>

            <form onSubmit={handleMessageAddress} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addressFormControls.map((controlItem) => {
                  const IconComponent = getFieldIcon(controlItem.name);
                  const isTextarea = controlItem.componentType === "textarea";
                  const isFullWidth = controlItem.name === "address" || controlItem.name === "notes";
                  
                  return (
                    <div
                      key={controlItem.name}
                      className={`space-y-2 ${isFullWidth ? "md:col-span-2" : ""}`}
                    >
                      <label
                        htmlFor={controlItem.name}
                        className="flex items-center gap-2 text-sm font-semibold text-foreground dark:text-foreground
                          transition-colors duration-200"
                      >
                        <IconComponent className="h-4 w-4 text-primary" />
                        {controlItem.label}
                        <span className="text-destructive">*</span>
                      </label>
                      
                      {isTextarea ? (
                        <div className="relative group">
                          <Textarea
                            id={controlItem.name}
                            name={controlItem.name}
                            placeholder={controlItem.placeholder}
                            value={formData[controlItem.name] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [controlItem.name]: e.target.value,
                              })
                            }
                            className="min-h-[120px] w-full px-4 py-3 pr-12
                              bg-background/50 dark:bg-background/30
                              border-2 border-border/50 dark:border-border/30
                              rounded-xl text-foreground dark:text-foreground
                              placeholder:text-muted-foreground/50
                              focus:border-primary focus:bg-background dark:focus:bg-background/50
                              focus:ring-2 focus:ring-primary/20
                              transition-all duration-300
                              resize-none
                              backdrop-blur-sm"
                          />
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-200">
                            <FileText className="h-4 w-4 text-muted-foreground/30" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 
                            text-muted-foreground/40 group-focus-within:text-primary
                            transition-colors duration-200 z-10">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <Input
                            id={controlItem.name}
                            name={controlItem.name}
                            type={controlItem.type || "text"}
                            placeholder={controlItem.placeholder}
                            value={formData[controlItem.name] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [controlItem.name]: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 h-12
                              bg-background/50 dark:bg-background/30
                              border-2 border-border/50 dark:border-border/30
                              rounded-xl text-foreground dark:text-foreground
                              placeholder:text-muted-foreground/50
                              focus:border-primary focus:bg-background dark:focus:bg-background/50
                              focus:ring-2 focus:ring-primary/20
                              transition-all duration-300
                              backdrop-blur-sm
                              hover:border-primary/50"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid()}
                  className="flex-1 h-12 rounded-xl font-semibold text-base
                    bg-gradient-to-r from-primary to-primary/90
                    hover:from-primary/90 hover:to-primary
                    text-primary-foreground
                    shadow-lg shadow-primary/25
                    hover:shadow-xl hover:shadow-primary/40
                    disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:hover:shadow-lg disabled:hover:shadow-primary/25
                    transition-all duration-300
                    flex items-center justify-center gap-2
                    group"
                >
                  {currentEditId ? (
                    <>
                      <Edit2 className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Update Address
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                      Add Address
                    </>
                  )}
                </Button>
                
                {currentEditId && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="sm:w-auto h-12 px-6 rounded-xl font-semibold
                      border-2 border-border/50
                      hover:border-destructive/50 hover:bg-destructive/10
                      hover:text-destructive
                      transition-all duration-300"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {/* Helper Text */}
              <div className="flex items-start gap-2 p-4 rounded-xl
                bg-muted/30 dark:bg-muted/20
                border border-border/30">
                <div className="mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {addressList.length >= 3 && currentEditId === null
                    ? "You have reached the maximum limit of 3 addresses. Please edit or delete an existing address to add a new one."
                    : "All fields are required. Make sure to provide accurate information for smooth delivery."}
                </p>
              </div>
            </form>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

export default Address;
