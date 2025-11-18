import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "/assets/account2.png";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";

function ShoppingAccount() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-navy-950 dark:to-black transition-colors duration-500">
      {/* قسم الهيدر بالصور */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          className="w-full h-full object-cover object-center brightness-90"
          alt="الحساب الشخصي"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent dark:from-navy-950/70 dark:via-navy-900/40" />
        <div className="absolute bottom-6 left-8 text-3xl md:text-4xl font-bold tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          حسابي
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto py-10 px-4 md:px-8">
        <div
          className="rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-900 
                     bg-white/80 dark:bg-navy-950/60 backdrop-blur-xl 
                     transition-all duration-500"
        >
          <Tabs defaultValue="orders" className="w-full">
            {/* ترويسة الـ Tabs */}
            <TabsList
              className="flex justify-center gap-4 bg-gray-100/70 dark:bg-navy-900/60 
                         border border-gray-200 dark:border-navy-800 
                         rounded-xl p-2 mt-6 mx-auto w-fit backdrop-blur-md"
            >
              <TabsTrigger
                value="orders"
                className="px-6 py-2 rounded-lg text-sm font-medium 
                           data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-400 data-[state=active]:to-gold-600 
                           data-[state=active]:text-navy-950 dark:data-[state=active]:text-navy-950
                           data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300
                           hover:scale-[1.05] transition-all duration-300"
              >
                🧾 الطلبات
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="px-6 py-2 rounded-lg text-sm font-medium 
                           data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-400 data-[state=active]:to-gold-600 
                           data-[state=active]:text-navy-950 dark:data-[state=active]:text-navy-950
                           data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300
                           hover:scale-[1.05] transition-all duration-300"
              >
                🏠 العنوان
              </TabsTrigger>
            </TabsList>

            {/* محتوى الـ Tabs */}
            <div className="p-6 md:p-8">
              <TabsContent
                value="orders"
                className="animate-in fade-in duration-300"
              >
                <ShoppingOrders />
              </TabsContent>
              <TabsContent
                value="address"
                className="animate-in fade-in duration-300"
              >
                <Address />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
